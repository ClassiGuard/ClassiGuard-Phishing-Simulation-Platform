import axios from 'axios';
import { getSystemSettings } from './systemSettingService.js';

export async function sendTeamsMessage(payload) {
  try {
    const settings = await getSystemSettings();
    if (!settings || !settings.msTeams || !settings.msTeams.enabled || !settings.msTeams.webhookUrl) {
      return false;
    }

    await axios.post(settings.msTeams.webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return true;
  } catch (error) {
    console.error('[MS Teams] Failed to send webhook:', error.message);
    return false;
  }
}

export async function sendTeamsCampaignAlert(campaign, action = 'started') {
  try {
    const settings = await getSystemSettings();
    if (!settings || !settings.msTeams || !settings.msTeams.enabled) return;

    // Check if the campaign has overrides, else fallback to global settings
    const notifyStart = campaign.msTeams && 'notifyOnStart' in campaign.msTeams ? campaign.msTeams.notifyOnStart : settings.msTeams.notifyOnCampaignStart;
    const notifyFinish = campaign.msTeams && 'notifyOnFinish' in campaign.msTeams ? campaign.msTeams.notifyOnFinish : settings.msTeams.notifyOnCampaignFinish;

    if (action === 'started' && !notifyStart) return;
    if (action === 'finished' && !notifyFinish) return;

    const color = action === 'started' ? '0078D7' : '107C10';
    const statusText = action === 'started' ? 'Started' : 'Completed';

    const payload = {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      "themeColor": color,
      "summary": `CyPhish Campaign ${statusText}`,
      "sections": [{
        "activityTitle": `CyPhish Campaign **${statusText}**`,
        "activitySubtitle": `Campaign: ${campaign.name}`,
        "facts": [
          { "name": "Campaign ID:", "value": campaign._id.toString() },
          { "name": "Status:", "value": campaign.status }
        ],
        "markdown": true
      }]
    };

    await sendTeamsMessage(payload);
  } catch (error) {
    console.error('[MS Teams] Error preparing campaign alert:', error.message);
  }
}

export async function sendTeamsPhishingReportedAlert(contact, campaign) {
  try {
    const settings = await getSystemSettings();
    if (!settings || !settings.msTeams || !settings.msTeams.enabled) return;

    const notifyPhish = campaign && campaign.msTeams && 'notifyOnPhishReport' in campaign.msTeams ? campaign.msTeams.notifyOnPhishReport : settings.msTeams.notifyOnPhishingReported;
    if (!notifyPhish) return;

    const payload = {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      "themeColor": "D13438",
      "summary": "User Reported Phishing Simulation",
      "sections": [{
        "activityTitle": "🚨 User Reported Phishing Simulation",
        "activitySubtitle": `${contact.email} correctly reported a simulated email`,
        "facts": [
          { "name": "User Name:", "value": `${contact.firstName} ${contact.lastName}` },
          { "name": "Campaign:", "value": campaign ? campaign.name : 'Unknown' }
        ],
        "markdown": true
      }]
    };

    await sendTeamsMessage(payload);
  } catch (error) {
    console.error('[MS Teams] Error preparing phishing report alert:', error.message);
  }
}
