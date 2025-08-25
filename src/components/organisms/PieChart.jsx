import React from "react";
import Chart from "react-apexcharts";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const PieChart = ({ data, title = "Spending by Category" }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-br from-primary/10 to-blue-600/10 p-3 rounded-xl border border-primary/20">
              <ApperIcon name="PieChart" size={20} className="text-primary" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <ApperIcon name="PieChart" size={48} className="text-gray-300 mx-auto mb-4" />
              <p>No data to display</p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

const chartData = {
    series: data.map(item => parseFloat(item.amount) || 0),
    options: {
      chart: {
        type: 'pie',
        height: 350,
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        }
      },
      labels: data.map(item => item.category || 'Unknown'),
      colors: ['#2563EB', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#06B6D4'],
      legend: {
        position: 'bottom',
        fontSize: '14px',
        fontFamily: 'Inter, ui-sans-serif, system-ui',
        markers: {
          width: 12,
          height: 12,
          radius: 6
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function (val, opts) {
          const value = opts.w.config.series[opts.seriesIndex];
          return val > 5 ? val.toFixed(1) + "%" : "";
        },
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, ui-sans-serif, system-ui',
          fontWeight: '600',
          colors: ['#ffffff']
        },
        dropShadow: {
          enabled: true,
          blur: 3,
          opacity: 0.8
        }
      },
      plotOptions: {
        pie: {
          donut: {
            size: '0%'
          },
          expandOnClick: true
        }
      },
      tooltip: {
        enabled: true,
        y: {
          formatter: function (val) {
            return "$" + (parseFloat(val) || 0).toFixed(2);
          }
        },
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, ui-sans-serif, system-ui'
        }
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            height: 300
          },
          legend: {
            fontSize: '12px'
          }
        }
      }]
    }
  };

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-br from-primary/10 to-blue-600/10 p-3 rounded-xl border border-primary/20">
            <ApperIcon name="PieChart" size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600">Visual breakdown of your expenses</p>
          </div>
        </div>
        
        <Chart 
          options={chartData.options} 
          series={chartData.series} 
          type="pie" 
          height={350} 
        />
      </div>
    </Card>
  );
};

export default PieChart;