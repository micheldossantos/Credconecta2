"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export function StockTicker() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Simulação de dados da bolsa (em produção, usar API real)
  const generateMockStockData = (): StockData[] => {
    const stockSymbols = [
      { symbol: 'PETR4', name: 'Petrobras' },
      { symbol: 'VALE3', name: 'Vale' },
      { symbol: 'ITUB4', name: 'Itaú' },
      { symbol: 'BBDC4', name: 'Bradesco' },
      { symbol: 'ABEV3', name: 'Ambev' },
      { symbol: 'MGLU3', name: 'Magazine Luiza' },
      { symbol: 'WEGE3', name: 'WEG' },
      { symbol: 'SUZB3', name: 'Suzano' }
    ];

    return stockSymbols.map(stock => {
      // Simular preços e variações realistas
      const basePrice = Math.random() * 100 + 10;
      const change = (Math.random() - 0.5) * 4; // Variação entre -2 e +2
      const changePercent = (change / basePrice) * 100;

      return {
        symbol: stock.symbol,
        name: stock.name,
        price: Number(basePrice.toFixed(2)),
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2))
      };
    });
  };

  const fetchStockData = async () => {
    try {
      setLoading(true);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Em produção, substituir por chamada real da API
      // const response = await fetch('https://api.hgbrasil.com/finance/stock_price?key=YOUR_KEY&symbol=petr4,vale3,itub4');
      // const data = await response.json();
      
      const mockData = generateMockStockData();
      setStocks(mockData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao buscar dados da bolsa:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Buscar dados iniciais
    fetchStockData();

    // Configurar atualização automática a cada 5 segundos
    const interval = setInterval(fetchStockData, 5000);

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3" />;
    if (change < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getBadgeVariant = (change: number) => {
    if (change > 0) return 'default';
    if (change < 0) return 'destructive';
    return 'secondary';
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-700">Bolsa de Valores - B3</h3>
            {loading && <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />}
          </div>
          <div className="text-xs text-gray-500">
            Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {stocks.map((stock) => (
            <div key={stock.symbol} className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-xs font-medium text-gray-700 mb-1">
                {stock.symbol}
              </div>
              <div className="text-sm font-bold mb-1">
                R$ {stock.price.toFixed(2)}
              </div>
              <div className={`flex items-center justify-center gap-1 text-xs ${getChangeColor(stock.change)}`}>
                {getChangeIcon(stock.change)}
                <span>{stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}</span>
              </div>
              <Badge 
                variant={getBadgeVariant(stock.change)} 
                className="text-xs mt-1"
              >
                {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(1)}%
              </Badge>
            </div>
          ))}
        </div>
        
        <div className="mt-3 text-xs text-gray-500 text-center">
          💡 Dados simulados para demonstração • Atualização automática a cada 5 segundos
        </div>
      </CardContent>
    </Card>
  );
}