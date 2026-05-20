import nodemailer from 'nodemailer';

function createTransport() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  });
}

export async function notifyNewContact(contact) {
  if (!process.env.SMTP_USER) return;

  const transporter = createTransport();
  await transporter.sendMail({
    from:    process.env.SMTP_FROM || 'alunomakerdigital@gmail.com',
    to:      'francenylson@gmail.com',
    subject: `[AMD] Novo contato: ${contact.name}`,
    text: [
      `Nome: ${contact.name}`,
      `E-mail: ${contact.email}`,
      `Assunto: ${contact.subject || '—'}`,
      `Mensagem:\n${contact.message}`,
      `Recebido em: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`,
    ].join('\n'),
  });
}

export async function notifyNewVisit(visit) {
  if (!process.env.SMTP_USER) return;

  const transporter = createTransport();
  await transporter.sendMail({
    from:    process.env.SMTP_FROM || 'alunomakerdigital@gmail.com',
    to:      'francenylson@gmail.com',
    subject: `[AMD] Novo agendamento: ${visit.name}`,
    text: [
      `Nome: ${visit.name}`,
      `E-mail: ${visit.email}`,
      `Telefone: ${visit.phone || '—'}`,
      `Data solicitada: ${visit.visit_date}`,
      `Mensagem:\n${visit.message || '—'}`,
      `Recebido em: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`,
    ].join('\n'),
  });
}
