function cleanLink(link) {
  return link.replace(/^http:/i, 'https:').replace(/[\u2026]/g, ''); 
}

function processLink(currentLink, shouldConvertHttpToHttps) {
  const originalHref = currentLink.getAttribute('href');
  const linkText = currentLink.textContent;

  if (originalHref && originalHref.includes('t.co')) {
    const fullLink = linkText.match(/(https?:\/\/\S+)/i);

    if (fullLink && fullLink[0]) {
      let cleanLinkHref = decodeURIComponent(fullLink[0]);
      cleanLinkHref = cleanLink(cleanLinkHref);

      if (shouldConvertHttpToHttps) {
        cleanLinkHref = cleanLinkHref.replace(/^http:/i, 'https:');
      }

      currentLink.setAttribute('href', cleanLinkHref);
    }
  }
}

function replaceTcoLinks(shouldConvertHttpToHttps = true) {
  const links = document.querySelectorAll('a[href*="t.co"]');
  links.forEach(function(currentLink) {
    processLink(currentLink, shouldConvertHttpToHttps);
  });
}

replaceTcoLinks();

const observer = new MutationObserver(function(mutationsList) {
  mutationsList.forEach(function(mutation) {
    if (mutation.type === 'childList') {
      replaceTcoLinks();
    }
  });
});

observer.observe(document.body, { childList: true, subtree: true });

function getExtensionEnabledState() {
  browser.storage.sync.get('extensionEnabled').then((data) => {
    const isExtensionEnabled = data.extensionEnabled ?? true;
    if (isExtensionEnabled) {
      replaceTcoLinks();
    }
  });
}

getExtensionEnabledState();

browser.runtime.onMessage.addListener(function(message) {
  if (message.enableExtension !== undefined) {
    browser.storage.sync.set({ extensionEnabled: message.enableExtension });
  }
});
