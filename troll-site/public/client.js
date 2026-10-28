(function() {
  const localData = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenRes: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cookiesEnabled: navigator.cookieEnabled,
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    url: window.location.href,
    referrer: document.referrer,
    timestamp: new Date().toISOString()
  };

  // O Netlify Functions roda em /_functions/nome-da-funcao
  fetch('/.netlify/functions/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(localData)
  })
  .then(res => res.json())
  .then(data => {
    const grid = document.getElementById('infoGrid');
    const fields = [
      { label: 'IP Address', value: data.ip },
      { label: 'Cidade', value: data.city },
      { label: 'País', value: data.country },
      { label: 'ISP', value: data.isp },
      { label: 'Plataforma', value: data.platform },
      { label: 'Mobile', value: data.isMobile ? 'Sim' : 'Não' },
      { label: 'Idioma', value: data.language },
      { label: 'Resolução', value: data.screenRes },
      { label: 'Timezone', value: data.timezone },
      { label: 'Referrer', value: data.referrer || 'Direto' }
    ];

    fields.forEach(field => {
      const div = document.createElement('div');
      div.className = 'info-item';
      div.innerHTML = `
        <span class="info-label">${field.label}</span>
        <span class="info-value">${field.value || 'N/A'}</span>
      `;
      grid.appendChild(div);
    });
  })
  .catch(err => console.error('Erro ao logar:', err));
})();