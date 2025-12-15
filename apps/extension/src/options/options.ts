/**
 * Options Page Script
 *
 * Manages the display and removal of granted domain permissions.
 */

// DOM Elements
const domainsList = document.getElementById('domains-list') as HTMLUListElement;
const emptyState = document.getElementById('empty-state') as HTMLLIElement;
const actionsDiv = document.getElementById('actions') as HTMLDivElement;
const removeAllBtn = document.getElementById('remove-all-btn') as HTMLButtonElement;
const versionEl = document.getElementById('version') as HTMLParagraphElement;
const toast = document.getElementById('toast') as HTMLDivElement;

// Show toast notification
function showToast(message: string, duration = 3000): void {
  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// Get all granted origins (excluding extension and chrome-specific URLs)
async function getGrantedOrigins(): Promise<string[]> {
  try {
    const permissions = await chrome.permissions.getAll();
    const origins = permissions.origins || [];

    return origins
      .filter((origin) => {
        // Exclude special patterns
        if (origin === '<all_urls>') return false;
        if (origin.startsWith('chrome://')) return false;
        if (origin.startsWith('chrome-extension://')) return false;
        return true;
      })
      .map((origin) => origin.replace(/\/\*$/, ''));
  } catch (error) {
    console.error('Failed to get permissions:', error);
    return [];
  }
}

// Remove permission for a specific origin
async function removePermission(origin: string): Promise<boolean> {
  try {
    const pattern = `${origin}/*`;
    return await chrome.permissions.remove({ origins: [pattern] });
  } catch (error) {
    console.error('Failed to remove permission:', error);
    return false;
  }
}

// Remove all permissions
async function removeAllPermissions(): Promise<void> {
  const origins = await getGrantedOrigins();

  for (const origin of origins) {
    await removePermission(origin);
  }
}

// Create a domain list item
function createDomainItem(origin: string): HTMLLIElement {
  const li = document.createElement('li');

  const span = document.createElement('span');
  span.className = 'domain-url';
  span.textContent = origin;

  const removeBtn = document.createElement('button');
  removeBtn.className = 'btn-secondary';
  removeBtn.textContent = 'Remove';
  removeBtn.addEventListener('click', async () => {
    removeBtn.disabled = true;
    removeBtn.textContent = 'Removing...';

    const success = await removePermission(origin);

    if (success) {
      showToast(`Removed permission for ${origin}`);
      await refreshDomainsList();
    } else {
      showToast('Failed to remove permission');
      removeBtn.disabled = false;
      removeBtn.textContent = 'Remove';
    }
  });

  li.appendChild(span);
  li.appendChild(removeBtn);

  return li;
}

// Refresh the domains list
async function refreshDomainsList(): Promise<void> {
  const origins = await getGrantedOrigins();

  // Clear existing items (except empty state)
  const existingItems = domainsList.querySelectorAll('li:not(#empty-state)');
  existingItems.forEach((item) => item.remove());

  if (origins.length === 0) {
    emptyState.style.display = 'block';
    actionsDiv.style.display = 'none';
  } else {
    emptyState.style.display = 'none';
    actionsDiv.style.display = 'flex';

    for (const origin of origins) {
      const item = createDomainItem(origin);
      domainsList.insertBefore(item, emptyState);
    }
  }
}

// Initialize the options page
async function init(): Promise<void> {
  // Display version
  const manifest = chrome.runtime.getManifest();
  versionEl.textContent = `Version: ${manifest.version}`;

  // Load and display domains
  await refreshDomainsList();

  // Set up remove all button
  removeAllBtn.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to remove all domain permissions?')) {
      return;
    }

    removeAllBtn.disabled = true;
    removeAllBtn.textContent = 'Removing...';

    await removeAllPermissions();
    showToast('All permissions removed');
    await refreshDomainsList();

    removeAllBtn.disabled = false;
    removeAllBtn.textContent = 'Remove All Permissions';
  });

  // Listen for permission changes
  chrome.permissions.onAdded.addListener(async () => {
    await refreshDomainsList();
  });

  chrome.permissions.onRemoved.addListener(async () => {
    await refreshDomainsList();
  });
}

// Run initialization
init();

