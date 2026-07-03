import { ClientService } from './ClientService';
import { DebtsService } from './DebtsService';
import { parseAmount } from '../utils/currency';
import { parseDateValue, getDaysNumber } from '../utils/helpers';

const DEBT_STATUS = 'دين';
const PAYMENT_STATUS = 'تسديد';

function getClientExpiryDate(client) {
  const verifyDate = parseDateValue(client.tverify);
  if (!verifyDate) return null;
  const days = getDaysNumber(client.mdaysT);
  const expiry = new Date(verifyDate);
  expiry.setDate(expiry.getDate() + days);
  return expiry;
}

function isInCurrentMonth(dateValue) {
  const date = parseDateValue(dateValue);
  if (!date) return false;
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

function buildRecentActivities(debts, clients) {
  const debtActivities = debts.map((debt) => ({
    id: `debt-${debt.id}`,
    type: debt.status === PAYMENT_STATUS ? 'payment' : 'debt',
    title: debt.clientName || debt.customer || '-',
    subtitle: debt.status || '-',
    amount: parseAmount(debt.amount),
    date: debt.dateInsert,
    sortDate: parseDateValue(debt.dateInsert)?.getTime() || 0,
  }));

  const clientActivities = clients
    .filter((client) => client.datestart)
    .slice(0, 5)
    .map((client) => ({
      id: `client-${client.id}`,
      type: 'client',
      title: client.name || '-',
      subtitle: client.idcode || '-',
      amount: parseAmount(client.moneyy),
      date: client.datestart,
      sortDate: parseDateValue(client.datestart)?.getTime() || 0,
    }));

  return [...debtActivities, ...clientActivities]
    .sort((a, b) => b.sortDate - a.sortDate)
    .slice(0, 8);
}

export const DashboardService = {
  getStats: async () => {
    const [clients, debts] = await Promise.all([
      ClientService.getAll(),
      DebtsService.getAll(),
    ]);

    const now = new Date();
    const thirtyDaysFromNow = new Date(now);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const activeClients = clients.filter((client) => client.active);
    const clientsNotSent = clients.filter((client) => !client.datestart);
    const expiringSoon = clients.filter((client) => {
      const expiry = getClientExpiryDate(client);
      return expiry && expiry >= now && expiry <= thirtyDaysFromNow;
    });
    const expiredVerifications = clients.filter((client) => {
      const expiry = getClientExpiryDate(client);
      return expiry && expiry < now;
    });

    const pendingDebts = debts.filter((debt) => debt.status === DEBT_STATUS);
    const payments = debts.filter((debt) => debt.status === PAYMENT_STATUS);

    const totalDebt = pendingDebts.reduce((sum, debt) => sum + parseAmount(debt.amount), 0);
    const totalRevenue = payments.reduce((sum, debt) => sum + parseAmount(debt.amount), 0);
    const monthlyIncome = payments
      .filter((debt) => isInCurrentMonth(debt.dateInsert))
      .reduce((sum, debt) => sum + parseAmount(debt.amount), 0);
    const clientRevenue = clients.reduce((sum, client) => sum + parseAmount(client.moneyy), 0);

    const monthlyData = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const month = date.getMonth();
      const year = date.getFullYear();
      const label = `${String(month + 1).padStart(2, '0')}/${year}`;

      const income = payments
        .filter((debt) => {
          const debtDate = parseDateValue(debt.dateInsert);
          return debtDate && debtDate.getMonth() === month && debtDate.getFullYear() === year;
        })
        .reduce((sum, debt) => sum + parseAmount(debt.amount), 0);

      const debtAmount = pendingDebts
        .filter((debt) => {
          const debtDate = parseDateValue(debt.dateInsert);
          return debtDate && debtDate.getMonth() === month && debtDate.getFullYear() === year;
        })
        .reduce((sum, debt) => sum + parseAmount(debt.amount), 0);

      return { label, income, debt: debtAmount };
    });

    return {
      totalClients: clients.length,
      activeClients: activeClients.length,
      inactiveClients: clients.length - activeClients.length,
      clientsNotSent: clientsNotSent.length,
      expiringSoon: expiringSoon.length,
      expiredVerifications: expiredVerifications.length,
      totalDebt,
      totalRevenue,
      monthlyIncome,
      clientRevenue,
      pendingDebtsCount: pendingDebts.length,
      paymentsCount: payments.length,
      monthlyData,
      recentActivities: buildRecentActivities(debts, clients),
      debtVsPayment: {
        debt: totalDebt,
        payment: totalRevenue,
      },
    };
  },
};
