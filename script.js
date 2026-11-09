const prices = { male: 50, female: 45, lounge: 1400 };
const quantities = { male: 0, female: 0 };
const selectedLounges = new Map();
const brl = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const totalTickets = () => quantities.male + quantities.female;
const totalLounges = () => selectedLounges.size;
const totalPrice = () => quantities.male * prices.male + quantities.female * prices.female + totalLounges() * prices.lounge;

function renderOrder() {
  document.getElementById('male-count').textContent = quantities.male;
  document.getElementById('female-count').textContent = quantities.female;
  document.getElementById('male-summary').textContent = quantities.male;
  document.getElementById('female-summary').textContent = quantities.female;
  document.getElementById('total-tickets').textContent = totalTickets();
  document.getElementById('lounge-summary').textContent = `${totalLounges()} / 3`;
  const drinkSummary = [...selectedLounges.entries()].map(([id, drink]) => `L${id}: ${drink}`).join(' · ');
  document.getElementById('lounge-drink-summary').textContent = drinkSummary || '—';
  document.getElementById('total-price').textContent = brl(totalPrice());
  document.getElementById('pix-total').textContent = brl(totalPrice());
}
document.querySelectorAll('.qty-btn').forEach(button => {
  button.addEventListener('click', () => {
    const type = button.dataset.target;
    quantities[type] = Math.max(0, Math.min(20, quantities[type] + Number(button.dataset.step)));
    renderOrder();
  });
});

document.querySelectorAll('.lounge-check').forEach(check => {
  check.addEventListener('change', () => {
    const id = check.dataset.lounge;
    const select = document.getElementById(`lounge-drink-${id}`);
    if (check.checked) {
      selectedLounges.set(id, select.value);
      select.disabled = false;
    } else {
      selectedLounges.delete(id);
      select.disabled = true;
    }
    renderOrder();
  });
});
document.querySelectorAll('.lounge-drink').forEach(select => {
  select.addEventListener('change', () => {
    const id = select.id.split('-').pop();
    if (selectedLounges.has(id)) selectedLounges.set(id, select.value);
    renderOrder();
  });
});

const eventDate = new Date('2027-01-15T22:00:00-03:00').getTime();
function updateCountdown() {
  const diff = eventDate - Date.now();
  if (diff <= 0) {
    document.getElementById('days').textContent = '000';
    document.getElementById('hours').textContent = '00';
    document.getElementById('minutes').textContent = '00';
    document.getElementById('seconds').textContent = '00';
    document.getElementById('count-note').textContent = 'A MARRA COMEÇOU!';
    return;
  }
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  document.getElementById('days').textContent = String(days);
  document.getElementById('hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

document.getElementById('copy-pix').addEventListener('click', async () => {
  const key = document.getElementById('pix-key').textContent.trim();
  const feedback = document.getElementById('copy-feedback');
  try {
    await navigator.clipboard.writeText(key);
    feedback.textContent = 'Chave Pix copiada!';
  } catch (error) {
    const temp = document.createElement('textarea');
    temp.value = key;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    temp.remove();
    feedback.textContent = 'Chave Pix copiada!';
  }
});

document.getElementById('confirm-whatsapp').addEventListener('click', () => {
  const name = document.getElementById('buyer-name').value.trim();
  const age = Number(document.getElementById('buyer-age').value);
  if (!name) {
    alert('Por favor, informe seu nome completo.');
    document.getElementById('buyer-name').focus();
    return;
  }
  if (!Number.isInteger(age) || age < 16 || age > 99) {
    alert('A entrada é permitida a partir de 16 anos. Informe uma idade válida.');
    document.getElementById('buyer-age').focus();
    return;
  }
  if (totalLounges() > 0 && age < 18) {
    alert('A compra do lounge e o consumo de bebidas alcoólicas são permitidos somente para maiores de 18 anos.');
    document.getElementById('buyer-age').focus();
    return;
  }
  if (totalTickets() < 1 && totalLounges() < 1) {
    alert('Escolha pelo menos 1 ingresso ou 1 lounge para continuar.');
    return;
  }
  const phone = '5585986882730';
  const loungeDetails = [...selectedLounges.entries()].map(([id, drink]) =>
    `Lounge ${id}: 20 unidades de ${drink} + 2 garrafas de Absolut + energético (R$ ${prices.lounge.toLocaleString('pt-BR')},00)`
  );
  const message = [
    'Olá! Quero confirmar minha compra para a MARRA — 2ª EDIÇÃO.',
    '',
    `Nome completo: ${name}`,
    `Idade: ${age} anos`,
    `Ingressos masculinos: ${quantities.male}`,
    `Ingressos femininos: ${quantities.female}`,
    `Quantidade total de ingressos: ${totalTickets()}`,
    `Lounges selecionados: ${totalLounges()}`,
    ...loungeDetails,
    totalLounges() ? 'Cada lounge comporta até 10 pessoas, com pulseiras individuais e intransferíveis.' : '',
    `Valor total: ${brl(totalPrice())}`,
    '',
    'Vou anexar o comprovante do Pix nesta conversa.',
    'Chave Pix utilizada: 85986882730',
    '',
    'Estou ciente de que a confirmação é manual, após a conferência do pagamento.'
  ].filter(Boolean).join('\n');
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
});
renderOrder();
