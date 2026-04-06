import React from 'react';
import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Custom plugin to draw text labels on chart segments
const textLabelPlugin = {
  id: 'textLabelPlugin',
  afterDatasetsDraw(chart) {
    const { ctx, chartArea } = chart;
    const { width, height } = chartArea;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2.5; // Adjust radius for label placement

    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      meta.data.forEach((arc, index) => {
        const value = dataset.data[index];
        if (value === 0) return; // Skip if value is 0

        const angle = arc.startAngle + (arc.endAngle - arc.startAngle) / 2;
        const labelRadius = radius * 0.75; // Position label inside segment
        const x = centerX + Math.cos(angle) * labelRadius;
        const y = centerY + Math.sin(angle) * labelRadius;

        ctx.save();
        ctx.font = '12px Arial';
        ctx.fillStyle = '#FFFFFF'; // White text for contrast
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4; // Shadow for better readability
        ctx.fillText(
          `฿${value.toLocaleString('th-TH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          x,
          y
        );
        ctx.restore();
      });
    });
  },
};

const ProductSaleChart = ({ data, type }) => {
  // Extract sumTransfer for non-canceled and canceled transactions
  const nonCanceled = data?.productSales?.find((sale) => sale.isCancel === '0') || {
    sumTransfer: '0.00',
  };
  const canceled = data?.productSales?.find((sale) => sale.isCancel === '1') || {
    sumTransfer: '0.00',
  };

  // Prepare data for the Doughnut chart
  const chartData = {
    labels: ['Non-Canceled', 'Canceled'],
    datasets: [
      {
        data: [
          parseFloat(nonCanceled.sumTransfer) || 0,
          parseFloat(canceled.sumTransfer) || 0,
        ],
        backgroundColor: ['#3B82F6', '#EF4444'],
        borderColor: ['#FFFFFF', '#FFFFFF'],
        borderWidth: 2,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed || 0;
            return `${context.label}: ฿${value.toLocaleString('th-TH', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`;
          },
        },
      },
      title: {
        display: true,
        text: `${type} ${data?.typeLabel || ''}`,
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
    },
    maintainAspectRatio: false,
    plugins: [textLabelPlugin], // Register the custom plugin
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 w-full col-span-2">
      <div className="w-full h-64">
        <Doughnut data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

// PropTypes validation
ProductSaleChart.propTypes = {
  data: PropTypes.shape({
    typeLabel: PropTypes.string,
    contractTotalPaid: PropTypes.number,
    contractCount: PropTypes.number,
    totalCount: PropTypes.number,
    productSales: PropTypes.arrayOf(
      PropTypes.shape({
        isCancel: PropTypes.string,
        payType: PropTypes.string,
        bankNo: PropTypes.string,
        bankOwner: PropTypes.string,
        bankName: PropTypes.string,
        sumCash: PropTypes.string,
        sumTransfer: PropTypes.string,
        count: PropTypes.string,
      })
    ),
  }),
  type: PropTypes.oneOf(['Mobile', 'Accessibility']).isRequired,
};

// Default props
ProductSaleChart.defaultProps = {
  data: null,
};

export default ProductSaleChart;