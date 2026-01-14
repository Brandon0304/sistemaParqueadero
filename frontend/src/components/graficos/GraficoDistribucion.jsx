import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const GraficoDistribucion = ({ datos }) => {
    if (!datos || datos.length === 0) {
        return <div className="text-center py-4 text-gray-500">No hay vehículos activos</div>;
    }

    // Colores para cada tipo de vehículo
    const COLORES = {
        'AUTO': '#3b82f6',      // Azul
        'MOTO': '#f59e0b',      // Naranja
        'BICICLETA': '#10b981', // Verde
        'CAMION': '#ef4444'     // Rojo
    };

    const datosConColor = datos.map(item => ({
        ...item,
        name: item.tipoVehiculo,
        value: item.cantidad,
        color: COLORES[item.tipoVehiculo] || '#6b7280'
    }));

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                    <p className="font-semibold">{data.tipoVehiculo}</p>
                    <p className="text-sm">Cantidad: <strong>{data.cantidad}</strong></p>
                    <p className="text-sm">Porcentaje: <strong>{data.porcentaje}%</strong></p>
                </div>
            );
        }
        return null;
    };

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent < 0.05) return null; // No mostrar etiqueta si es menos del 5%

        return (
            <text 
                x={x} 
                y={y} 
                fill="white" 
                textAnchor={x > cx ? 'start' : 'end'} 
                dominantBaseline="central"
                className="font-semibold"
                fontSize={14}
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Distribución de Vehículos Activos</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={datosConColor}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {datosConColor.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value, entry) => {
                            const item = datos.find(d => d.tipoVehiculo === value);
                            return `${value} (${item ? item.cantidad : 0})`;
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className="mt-3 text-center text-sm text-gray-600">
                Total de vehículos activos: <strong>{datos.reduce((sum, d) => sum + d.cantidad, 0)}</strong>
            </div>
        </div>
    );
};

export default GraficoDistribucion;
