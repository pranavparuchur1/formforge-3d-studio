// Independent of Three so module/network failure still permits raw JSON rescue.
(() => {
  const error = () => {
    document.getElementById('webgl-error').classList.remove('hidden');
    document.getElementById('viewport-placeholder').classList.add('hidden');
    document.getElementById('renderer-state').textContent = 'LOAD ERROR';
    document.getElementById('live-state').textContent = '3D unavailable';
  };
  document.getElementById('btn-retry').onclick = () => location.reload();
  document.getElementById('btn-rescue').onclick = () => {
    try {
      const raw = localStorage.getItem('formforge.project.v1');
      if (!raw) { alert('No saved project found in this browser.'); return; }
      const url = URL.createObjectURL(new Blob([raw], {type:'application/json'}));
      const a = document.createElement('a'); a.href=url; a.download='formforge-recovery.json'; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { alert('Browser storage is unavailable. Use the editor’s Project file export if available.'); }
  };
  setTimeout(() => { if (!window.__formforgeReady && !window.__formforgeFailed) error(); }, 12000);
})();
