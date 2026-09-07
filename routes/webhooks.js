import express from 'express';
import { answerWebhook, gatherWebhook, statusWebhook } from '../controllers/telephonyWebhookController.js';

const router = express.Router();

// Parse urlencoded bodies for webhooks since Twilio sends application/x-www-form-urlencoded
router.use(express.urlencoded({ extended: true }));

router.post('/voice/:provider/answer', answerWebhook);
router.post('/voice/:provider/gather', gatherWebhook);
router.post('/voice/:provider/status', statusWebhook);

export default router;
