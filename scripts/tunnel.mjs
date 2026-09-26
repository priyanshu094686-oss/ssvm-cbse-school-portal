import localtunnel from 'localtunnel';

async function startTunnel() {
  try {
    const tunnel = await localtunnel({ port: 4000 });
    console.log('====================================================');
    console.log('🚀 LIVE PUBLIC TUNNEL ACTIVE:');
    console.log(`👉 ${tunnel.url}`);
    console.log('====================================================');

    tunnel.on('close', () => {
      console.log('Tunnel disconnected. Reconnecting in 3 seconds...');
      setTimeout(startTunnel, 3000);
    });

    tunnel.on('error', (err) => {
      console.warn('Tunnel notice:', err.message);
    });
  } catch (err) {
    console.warn('Failed to start tunnel, retrying in 5 seconds...', err);
    setTimeout(startTunnel, 5000);
  }
}

startTunnel();
