import React from "react";
import Chart from "react-apexcharts";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const LineChart = ({ data, title = "Spending Trends" }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-br from-secondary/10 to-purple-600/10 p-3 rounded-xl border border-secondary/20">
              <ApperIcon name="TrendingUp" size={20} className="text-secondary" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <ApperIcon name="TrendingUp" size={48} className="text-gray-300 mx-auto mb-4" />
              <p>No data to display</p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const chartData = {
    series: [
      {
        name: 'Expenses',
        data: data.map(item => ({ x: item.month, y: item.amount }))
      }
    ],
    options: {
      chart: {
        type: 'line',
        height: 350,
        toolbar: {
          show: false
        }
      },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      colors: ['#7C3AED'],
      xaxis: {
        type: 'category',
        labels: {
          style: {
            fontSize: '12px',
            fontFamily: 'Inter, ui-sans-serif, system-ui'
          }
        }
      },
      yaxis: {
        labels: {
          formatter: function (val) {
            return "$" + val.toFixed(0);
          },
          style: {
            fontSize: '12px',
            fontFamily: 'Inter, ui-sans-serif, system-ui'
          }
        }
      },
      grid: {
        borderColor: '#E5E7EB'
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return "$" + val.toFixed(2);
          }
        }
      },
      markers: {
        size: 4,
        colors: ['#7C3AED'],
        strokeColors: '#fff',
        strokeWidth: 2
      }
    }
  };

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-br from-secondary/10 to-purple-600/10 p-3 rounded-xl border border-secondary/20">
            <ApperIcon name="TrendingUp" size={20} className="text-secondary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600">Track your spending patterns over time</p>
          </div>
        </div>
        
        <Chart 
          options={chartData.options} 
          series={chartData.series} 
          type="line" 
          height={350} 
        />
      </div>
    </Card>
  );
};

export default LineChart;