import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const GraficoOcupacion = ({ datos }) => {
    if (!datos || datos.length === 0) {
        return <div className="text-center py-4 text-gray-500">No hay datos disponibles</div>;
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Ocupación por Hora (Últimas 24h)</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={datos}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                        dataKey="hora" 
                        tick={{ fontSize: 12 }}
                        interval={2}
                    />
                    <YAxis 
                        label={{ value: 'Vehículos', angle: -90, position: 'insideLeft' }}
                        tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                        labelStyle={{ fontWeight: 'bold' }}
                        formatter={(value, name) => {
                            if (name === 'ocupados') return [value, 'Ocupados'];
                            if (name === 'capacidadTotal') return [value, 'Capacidad'];
                            return [value, name];
                        }}
                    />
                    <Legend 
                        wrapperStyle={{ fontSize: '14px' }}
                        formatter={(value) => {
                            if (value === 'ocupados') return 'Ocupados';
                            if (value === 'capacidadTotal') return 'Capacidad Total';
                            return value;
                        }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="ocupados" 
                        stroke="#8b5cf6" 
                        strokeWidth={2}
                        dot={{ fill: '#8b5cf6', r: 3 }}
                        activeDot={{ r: 5 }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="capacidadTotal" 
                        stroke="#d1d5db" 
                        strokeWidth={1}
                        strokeDasharray="5 5"
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 mt-2 text-center">
                Línea punteada indica la capacidad total disponible
            </p>
        </div>
    );
};

export default GraficoOcupacion;
