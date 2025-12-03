document.addEventListener('DOMContentLoaded', async () => {
  const storageKey = 'tossInvestPlusFeatures';

  let features = { floatPanel: true };
  
  try {
    const result = await chrome.storage.sync.get(storageKey);
    if (result[storageKey]) {
      features = result[storageKey];
    }
  } catch (e) {
    console.log('[Toss Invest Plus] Storage 접근 실패, 기본값 사용');
  }
  
  document.getElementById('floatPanel').checked = features.floatPanel;
  
  document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', async (e) => {
      const featureId = e.target.id;
      const isEnabled = e.target.checked;
      
      features[featureId] = isEnabled;
      
      await chrome.storage.sync.set({ [storageKey]: features });
      
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.url?.includes('tossinvest.com')) {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: (key, data) => {
              localStorage.setItem(key, JSON.stringify(data));
              window.dispatchEvent(new StorageEvent('storage', {
                key: key,
                newValue: JSON.stringify(data),
                url: window.location.href
              }));
            },
            args: [storageKey, features]
          });
        }
      });
      
      console.log(`[Toss Invest Plus] ${featureId} 설정 변경: ${isEnabled}`);
    });
  });
});
