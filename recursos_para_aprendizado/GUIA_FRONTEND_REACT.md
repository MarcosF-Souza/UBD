# 📊 Guia Frontend React - Consumindo APIs Django

## 🎯 Objetivo

Implementar visualizações de dados no React consumindo os endpoints do backend Django.

---

## 📦 Bibliotecas Necessárias

### Instalar dependências:

```bash
cd frontend
npm install recharts axios
```

- **recharts**: Biblioteca de gráficos para React (mais simples que Chart.js)
- **axios**: Cliente HTTP (alternativa ao fetch com mais recursos)

---

## 🌐 Endpoints Disponíveis

### **Energia Solar**

| Endpoint | URL | Dados Retornados |
|----------|-----|------------------|
| Rendimento | `http://localhost:8000/api/energia/rendimento/` | Estatísticas, dados brutos, gráfico dispersão, mapa de calor |
| Correlação | `http://localhost:8000/api/energia/correlacao/` | Matriz de correlação, insights |
| Dados Completos | `http://localhost:8000/api/energia/dados/` | Todos os dados processados |

### **Saúde Cardíaca**

| Endpoint | URL | Dados Retornados |
|----------|-----|------------------|
| Correlação | `http://localhost:8000/api/saude/correlacao/` | Matriz de correlação de variáveis de saúde |
| Análise Risco | `http://localhost:8000/api/saude/analise-risco/` | Comparação risco alto vs baixo |
| Dados Completos | `http://localhost:8000/api/saude/dados/` | Todos os dados dos pacientes |

---

## 🚀 Implementação Passo a Passo

## Página: Energia Solar

### **Passo 1: Criar Hook Customizado para Buscar Dados**

Crie: `frontend/src/hooks/useEnergiaData.js`

```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/energia';

export const useEnergiaData = () => {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/rendimento/`);
        setDados(response.data);
        setLoading(false);
      } catch (error) {
        setErro(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { dados, loading, erro };
};
```

**Por que isso é útil?**
- Reutilizável em qualquer componente
- Gerencia estados de loading, erro e dados automaticamente
- Separa lógica de fetch da UI

---

### **Passo 2: Criar Componente de Cards de Estatísticas**

Crie: `frontend/src/components/energypage/EnergySummary.jsx`

```jsx
export default function EnergySummary({ estatisticas }) {
  if (!estatisticas) return null;

  const cards = [
    {
      titulo: 'Rendimento Médio',
      valor: `${estatisticas.rendimento_medio}%`,
      cor: 'blue',
    },
    {
      titulo: 'Rendimento Máximo',
      valor: `${estatisticas.rendimento_maximo}%`,
      cor: 'green',
    },
    {
      titulo: 'Hora Pico',
      valor: `${estatisticas.hora_pico}h`,
      cor: 'yellow',
    },
    {
      titulo: 'Potência Máxima',
      valor: `${estatisticas.potencia_max} kW`,
      cor: 'purple',
    },
  ];

  const corClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => (
        <div key={index} className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <p className="text-gray-400 text-sm mb-2">{card.titulo}</p>
          <p className={`text-3xl font-bold text-white`}>
            {card.valor}
          </p>
          <div className={`h-1 ${corClasses[card.cor]} rounded mt-4`}></div>
        </div>
      ))}
    </div>
  );
}
```

**JSON usado:**
```json
{
  "estatisticas": {
    "rendimento_medio": 44.29,
    "rendimento_maximo": 47.06,
    "hora_pico": 8,
    "potencia_max": 4.1
  }
}
```

---

### **Passo 3: Criar Gráfico de Dispersão (Temperatura × Potência)**

Crie: `frontend/src/components/energypage/EnergyTempPot.jsx`

```jsx
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function EnergyTempPot({ dadosGrafico }) {
  if (!dadosGrafico) return null;

  // Transformar arrays separados em array de objetos
  const data = dadosGrafico.temperatura.map((temp, index) => ({
    temperatura: temp,
    potencia: dadosGrafico.potencia[index],
  }));

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">
        Temperatura × Potência Gerada
      </h2>
      
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            type="number"
            dataKey="temperatura"
            name="Temperatura"
            unit="°C"
            stroke="#9CA3AF"
            label={{ value: 'Temperatura (°C)', position: 'insideBottom', offset: -10, fill: '#9CA3AF' }}
          />
          <YAxis
            type="number"
            dataKey="potencia"
            name="Potência"
            unit=" kW"
            stroke="#9CA3AF"
            label={{ value: 'Potência (kW)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
            labelStyle={{ color: '#F3F4F6' }}
          />
          <Legend wrapperStyle={{ color: '#9CA3AF' }} />
          <Scatter
            name="Painéis Solares"
            data={data}
            fill="#3B82F6"
            line={{ stroke: '#3B82F6', strokeWidth: 2 }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
```

**JSON usado:**
```json
{
  "dados_grafico_dispersao": {
    "temperatura": [24, 28, 32, 34, 31],
    "potencia": [3.2, 3.9, 4.1, 4.0, 3.6]
  }
}
```

**Como funciona:**
1. Recebe arrays separados de temperatura e potência
2. Combina em array de objetos `[{temperatura: 24, potencia: 3.2}, ...]`
3. Recharts renderiza os pontos automaticamente
4. Tooltip mostra valores ao passar o mouse

---

### **Passo 4: Criar Mapa de Calor (Hora × Eficiência)**

Crie: `frontend/src/components/energypage/EnergyEfficiencyByHour.jsx`

```jsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function EnergyEfficiencyByHour({ dadosMapaCalor }) {
  if (!dadosMapaCalor) return null;

  // Transformar em array de objetos
  const data = dadosMapaCalor.horas.map((hora, index) => ({
    hora: `${hora}h`,
    eficiencia: dadosMapaCalor.eficiencia[index],
  }));

  // Função para definir cor baseada na eficiência
  const getColor = (eficiencia) => {
    if (eficiencia >= 45) return '#10B981'; // Verde (alta)
    if (eficiencia >= 43) return '#F59E0B'; // Amarelo (média)
    return '#EF4444'; // Vermelho (baixa)
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">
        Eficiência por Hora do Dia
      </h2>
      
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="hora"
            stroke="#9CA3AF"
            label={{ value: 'Hora do Dia', position: 'insideBottom', offset: -10, fill: '#9CA3AF' }}
          />
          <YAxis
            stroke="#9CA3AF"
            label={{ value: 'Eficiência (%)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
            labelStyle={{ color: '#F3F4F6' }}
          />
          <Legend wrapperStyle={{ color: '#9CA3AF' }} />
          <Bar dataKey="eficiencia" name="Eficiência (%)">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.eficiencia)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legenda de Cores */}
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-300 text-sm">Alta (≥45%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-gray-300 text-sm">Média (43-45%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-gray-300 text-sm">Baixa (&lt;43%)</span>
        </div>
      </div>
    </div>
  );
}
```

**JSON usado:**
```json
{
  "dados_mapa_calor": {
    "horas": [8, 10, 12, 14, 16],
    "eficiencia": [47.06, 45.88, 44.57, 42.55, 41.38]
  }
}
```

**Como funciona:**
1. Transforma dados em objetos para o Recharts
2. Usa `Cell` para colorir cada barra individualmente
3. Função `getColor()` define cor baseada no valor
4. Legenda visual explica as cores

---

### **Passo 5: Criar Gráfico de Evolução da Eficiência**

Crie: `frontend/src/components/energypage/EnergyEvolution.jsx`

```jsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts';

export default function EnergyEvolution({ dadosMapaCalor }) {
  if (!dadosMapaCalor) return null;

  const data = dadosMapaCalor.horas.map((hora, index) => ({
    hora: `${hora}h`,
    eficiencia: dadosMapaCalor.eficiencia[index],
  }));

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">
        Evolução da Eficiência ao Longo do Dia
      </h2>
      
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <defs>
            <linearGradient id="colorEficiencia" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="hora"
            stroke="#9CA3AF"
            label={{ value: 'Hora do Dia', position: 'insideBottom', offset: -10, fill: '#9CA3AF' }}
          />
          <YAxis
            stroke="#9CA3AF"
            label={{ value: 'Eficiência (%)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
            labelStyle={{ color: '#F3F4F6' }}
          />
          <Legend wrapperStyle={{ color: '#9CA3AF' }} />
          <Area
            type="monotone"
            dataKey="eficiencia"
            fill="url(#colorEficiencia)"
            stroke="#3B82F6"
            strokeWidth={0}
          />
          <Line
            type="monotone"
            dataKey="eficiencia"
            stroke="#3B82F6"
            strokeWidth={3}
            dot={{ fill: '#3B82F6', r: 6 }}
            activeDot={{ r: 8 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

### **Passo 6: Integrar Tudo na Página Energia**

Edite: `frontend/src/pages/Energia.jsx`

```jsx
import { useEnergiaData } from '../hooks/useEnergiaData';
import EnergySummary from '../components/energypage/EnergySummary';
import EnergyTempPot from '../components/energypage/EnergyTempPot';
import EnergyEfficiencyByHour from '../components/energypage/EnergyEfficiencyByHour';
import EnergyEvolution from '../components/energypage/EnergyEvolution';

export default function Energia() {
  const { dados, loading, erro } = useEnergiaData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
          Carregando análise de energia solar...
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 max-w-md">
          <h2 className="text-red-500 text-xl font-bold mb-2">❌ Erro</h2>
          <p className="text-white">{erro}</p>
          <p className="text-gray-400 text-sm mt-4">
            Certifique-se de que o backend Django está rodando em http://localhost:8000
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          ☀️ Análise de Energia Solar
        </h1>
        <p className="text-gray-400">
          Análise de eficiência de painéis solares baseada em temperatura e radiação
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <EnergySummary estatisticas={dados.estatisticas} />

      {/* Gráficos em Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Gráfico de Dispersão */}
        <EnergyTempPot dadosGrafico={dados.dados_grafico_dispersao} />
        
        {/* Mapa de Calor */}
        <EnergyEfficiencyByHour dadosMapaCalor={dados.dados_mapa_calor} />
      </div>

      {/* Gráfico de Evolução (largura completa) */}
      <EnergyEvolution dadosMapaCalor={dados.dados_mapa_calor} />

      {/* Tabela de Dados Brutos */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg mt-6">
        <h2 className="text-xl font-bold text-white mb-4">📋 Dados por Hora</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-3">Hora</th>
                <th className="text-left p-3">Temperatura (°C)</th>
                <th className="text-left p-3">Radiação (W/m²)</th>
                <th className="text-left p-3">Potência (kW)</th>
                <th className="text-left p-3">Rendimento (%)</th>
              </tr>
            </thead>
            <tbody>
              {dados.dados_brutos.map((item, index) => (
                <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50 transition">
                  <td className="p-3">{item.hora}h</td>
                  <td className="p-3">{item.temperatura_c}°C</td>
                  <td className="p-3">{item.radiacao_wm2} W/m²</td>
                  <td className="p-3">{item.potencia_kw} kW</td>
                  <td className="p-3">
                    <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                      {item.percentual_rendimento.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

---

## 📊 Página: Saúde Cardíaca

### **Passo 7: Hook para Dados de Saúde**

Crie: `frontend/src/hooks/useSaudeData.js`

```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/saude';

export const useSaudeData = () => {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar múltiplos endpoints em paralelo
        const [dadosCompletos, analiseRisco, correlacao] = await Promise.all([
          axios.get(`${API_BASE_URL}/dados/`),
          axios.get(`${API_BASE_URL}/analise-risco/`),
          axios.get(`${API_BASE_URL}/correlacao/`),
        ]);

        setDados({
          completo: dadosCompletos.data,
          risco: analiseRisco.data,
          correlacao: correlacao.data,
        });
        setLoading(false);
      } catch (error) {
        setErro(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { dados, loading, erro };
};
```

**Por que Promise.all?**
- Busca todos os endpoints ao mesmo tempo
- Mais rápido que fazer 3 requisições sequenciais
- Só continua quando todas as requisições terminarem

---

### **Passo 8: Gráfico de Dispersão (Colesterol × Pressão)**

Crie: `frontend/src/components/saudepage/HealthScatterPlot.jsx`

```jsx
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function HealthScatterPlot({ graficos }) {
  if (!graficos) return null;

  const { colesterol, pressao, risco } = graficos.dispersao_colesterol_pressao;

  // Transformar em array de objetos
  const data = colesterol.map((col, index) => ({
    colesterol: col,
    pressao: pressao[index],
    risco: risco[index],
  }));

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">
        Colesterol × Pressão Arterial
      </h2>
      
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            type="number"
            dataKey="colesterol"
            name="Colesterol"
            unit=" mg/dL"
            stroke="#9CA3AF"
            label={{ value: 'Colesterol (mg/dL)', position: 'insideBottom', offset: -10, fill: '#9CA3AF' }}
          />
          <YAxis
            type="number"
            dataKey="pressao"
            name="Pressão"
            unit=" mmHg"
            stroke="#9CA3AF"
            label={{ value: 'Pressão (mmHg)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
            labelStyle={{ color: '#F3F4F6' }}
            formatter={(value, name) => {
              if (name === 'risco') return value === 1 ? 'Alto' : 'Baixo';
              return value;
            }}
          />
          <Legend wrapperStyle={{ color: '#9CA3AF' }} />
          <Scatter name="Pacientes" data={data}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.risco === 1 ? '#EF4444' : '#10B981'}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* Legenda */}
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          <span className="text-gray-300 text-sm">Risco Baixo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <span className="text-gray-300 text-sm">Risco Alto</span>
        </div>
      </div>
    </div>
  );
}
```

**JSON usado:**
```json
{
  "graficos": {
    "dispersao_colesterol_pressao": {
      "colesterol": [220, 180, 260, 170],
      "pressao": [140, 125, 155, 110],
      "risco": [1, 0, 1, 0]
    }
  }
}
```

---

### **Passo 9: Comparação Risco Alto vs Baixo**

Crie: `frontend/src/components/saudepage/HealthRiskComparison.jsx`

```jsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function HealthRiskComparison({ dadosRisco }) {
  if (!dadosRisco) return null;

  const data = [
    {
      metrica: 'Idade',
      'Risco Baixo': dadosRisco.risco_baixo.idade_media,
      'Risco Alto': dadosRisco.risco_alto.idade_media,
    },
    {
      metrica: 'Colesterol',
      'Risco Baixo': dadosRisco.risco_baixo.colesterol_medio,
      'Risco Alto': dadosRisco.risco_alto.colesterol_medio,
    },
    {
      metrica: 'Pressão',
      'Risco Baixo': dadosRisco.risco_baixo.pressao_media,
      'Risco Alto': dadosRisco.risco_alto.pressao_media,
    },
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">
        Comparação: Risco Alto vs Baixo
      </h2>
      
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="metrica"
            stroke="#9CA3AF"
          />
          <YAxis stroke="#9CA3AF" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
            labelStyle={{ color: '#F3F4F6' }}
          />
          <Legend wrapperStyle={{ color: '#9CA3AF' }} />
          <Bar dataKey="Risco Baixo" fill="#10B981" />
          <Bar dataKey="Risco Alto" fill="#EF4444" />
        </BarChart>
      </ResponsiveContainer>

      {/* Cards de Diferenças */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-gray-700 rounded p-4 text-center">
          <p className="text-gray-400 text-sm">Diferença Idade</p>
          <p className="text-2xl font-bold text-white">
            +{dadosRisco.diferencas.idade} anos
          </p>
        </div>
        <div className="bg-gray-700 rounded p-4 text-center">
          <p className="text-gray-400 text-sm">Diferença Colesterol</p>
          <p className="text-2xl font-bold text-white">
            +{dadosRisco.diferencas.colesterol} mg/dL
          </p>
        </div>
        <div className="bg-gray-700 rounded p-4 text-center">
          <p className="text-gray-400 text-sm">Diferença Pressão</p>
          <p className="text-2xl font-bold text-white">
            +{dadosRisco.diferencas.pressao} mmHg
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

## ✅ Checklist de Implementação

### Configuração Inicial
- [ ] Instalar `recharts` e `axios`
- [ ] Configurar ambiente (backend rodando em localhost:8000)
- [ ] Testar endpoints no navegador

### Página Energia
- [ ] Criar hook `useEnergiaData`
- [ ] Criar componente `EnergySummary`
- [ ] Criar componente `EnergyTempPot`
- [ ] Criar componente `EnergyEfficiencyByHour`
- [ ] Criar componente `EnergyEvolution`
- [ ] Integrar tudo em `Energia.jsx`

### Página Saúde
- [ ] Criar hook `useSaudeData`
- [ ] Criar componente `HealthScatterPlot`
- [ ] Criar componente `HealthRiskComparison`
- [ ] Integrar em `Saude.jsx`

### Testes
- [ ] Testar loading states
- [ ] Testar error handling
- [ ] Testar responsividade mobile
- [ ] Verificar tooltips funcionando

---

## 🎨 Dicas de Estilização

### Cores Sugeridas (Tailwind):
```js
// Fundo escuro
bg-gray-900, bg-gray-800, bg-gray-700

// Texto
text-white, text-gray-400, text-gray-300

// Cores de destaque
text-blue-500 (primário)
text-green-500 (positivo)
text-red-500 (negativo)
text-yellow-500 (aviso)
```

### Animações de Loading:
```jsx
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
```

---

## 🐛 Troubleshooting

### Erro: "Network Error"
**Causa**: Backend não está rodando
**Solução**: `cd backend && python manage.py runserver`

### Erro: "CORS policy"
**Causa**: CORS não configurado
**Solução**: Verificar `CORS_ALLOWED_ORIGINS` no Django settings

### Gráficos não aparecem
**Causa**: Dados no formato errado
**Solução**: Console.log os dados recebidos e verificar estrutura

### Página fica em loading infinito
**Causa**: Endpoint retornando erro 500
**Solução**: Verificar logs do Django no terminal

---

## 📚 Recursos Adicionais

- [Recharts Docs](https://recharts.org/)
- [Axios Docs](https://axios-http.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Hooks](https://react.dev/reference/react)

---

## 🎉 Resultado Esperado

Ao final, você terá:
- ✅ 2 páginas completas (Energia e Saúde)
- ✅ 6+ gráficos interativos
- ✅ Loading states e error handling
- ✅ Design responsivo e moderno
- ✅ Dados em tempo real do backend Django

**Bom desenvolvimento! 🚀**
