import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const GraficoIngresos = ({ datos }) => {
    if (!datos || datos.length === 0) {
        return <div className="text-center py-4 text-gray-500">No hay datos disponibles</div>;
    }

    // Colores para cada barra (degradado de verde)
    const colores = ['#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d'];

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Ingresos Diarios (Últimos 7 días)</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={datos}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                        dataKey="fecha" 
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                        label={{ value: 'Ingresos ($)', angle: -90, position: 'insideLeft' }}
                        tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                        labelStyle={{ fontWeight: 'bold' }}
                        formatter={(value, name) => {
                            if (name === 'totalIngresos') return [`$${value.toFixed(2)}`, 'Ingresos'];
                            if (name === 'totalTickets') return [value, 'Tickets'];
                            return [value, name];
                        }}
                    />
                    <Legend 
                        wrapperStyle={{ fontSize: '14px' }}
                        formatter={(value) => {
                            if (value === 'totalIngresos') return 'Ingresos';
                            if (value === 'totalTickets') return 'Tickets';
                            return value;
                        }}
                    />
                    <Bar dataKey="totalIngresos" radius={[8, 8, 0, 0]}>
                        {datos.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colores[index % colores.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-between items-center mt-3 text-sm text-gray-600">
                <span>Total últimos 7 días: <strong>${datos.reduce((sum, d) => sum + d.totalIngresos, 0).toFixed(2)}</strong></span>
                <span>Tickets: <strong>{datos.reduce((sum, d) => sum + d.totalTickets, 0)}</strong></span>
            </div>
        </div>
    );
};

export default GraficoIngresos;
