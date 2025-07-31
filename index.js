const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

// Inserisci qui il tuo Discord Webhook
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

const app = express();
app.use(bodyParser.json());

app.post('/github', async (req, res) => {
  const event = req.headers['x-github-event'];
  const payload = req.body;
  let message = '';

  try {
    switch (event) {
      case 'issues':
        if (payload.action === 'opened') {
          const issue = payload.issue;
          message = `📋 **Nuova Issue** da **${issue.user.login}**\n[#${issue.number}](${issue.html_url}) ${issue.title}`;
        }
        break;

      case 'push':
        const commits = payload.commits.map(c => `• [${c.id.slice(0, 7)}](${c.url}) ${c.message}`).join('\n');
        message = `🚀 **Push su ${payload.repository.full_name}** da **${payload.pusher.name}**\n${commits}`;
        break;

      case 'pull_request':
        if (payload.action === 'opened') {
          const pr = payload.pull_request;
          message = `🔀 **Nuova Pull Request** da **${pr.user.login}**\n[#${pr.number}](${pr.html_url}) ${pr.title}`;
        }
        break;

      default:
        message = `📢 Evento ricevuto: \`${event}\``;
    }

    if (message) {
      await axios.post(DISCORD_WEBHOOK_URL, { content: message });
      console.log('Messaggio inviato a Discord');
    } else {
      console.log('Nessun messaggio da inviare');
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Errore durante l\'invio a Discord:', err.message);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server attivo su http://localhost:${PORT}/github`);
});
