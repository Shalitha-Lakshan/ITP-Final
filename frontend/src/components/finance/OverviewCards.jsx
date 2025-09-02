import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, CreditCard, Clock, AlertCircle } from 'lucide-react';

const OverviewCards = () => {
  const [financeData, setFinanceData] = useState({
    totalRevenue: 0,
    netProfit: 0,
    paymentsReceived: { count: 0, amount: 0 },
    pendingPayments: { count: 0, amount: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinanceOverview();
  }, []);

  const fetchFinanceOverview = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/finance/overview');
      if (response.ok) {
        const data = await response.json();
        setFinanceData(data);
      }
    } catch (error) {
      console.error('Error fetching finance overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const cards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(financeData.totalRevenue),
      icon: DollarSign,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Net Profit',
      value: formatCurrency(financeData.netProfit),
      icon: TrendingUp,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Payments Received',
      value: formatCurrency(financeData.paymentsReceived.amount),
      subtitle: `${financeData.paymentsReceived.count} payments`,
      icon: CreditCard,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Pending Payments',
      value: formatCurrency(financeData.pendingPayments.amount),
      subtitle: `${financeData.pendingPayments.count} pending`,
      icon: Clock,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div
            key={index}
            className={`${card.bgColor} rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.color} p-3 rounded-lg`}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              {card.title === 'Pending Payments' && financeData.pendingPayments.count > 0 && (
                <AlertCircle className="w-5 h-5 text-orange-500" />
              )}
            </div>
            
            <div>
              <h3 className={`text-sm font-medium ${card.textColor} mb-1`}>
                {card.title}
              </h3>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {card.value}
              </p>
              {card.subtitle && (
                <p className="text-sm text-gray-500">
                  {card.subtitle}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OverviewCards;
