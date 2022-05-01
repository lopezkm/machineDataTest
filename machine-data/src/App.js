import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import JsonData from './csvjson.json';
import './App.css';

ChartJS.register(ArcElement, Tooltip, Legend);

function App() {

  const [data, setData] = useState({
    totalWorkedHours: 0,
    totalHoursOff: 0,
    totalHoursIdle: 0,
    totalHoursUnloaded: 0,
    totalHoursLoaded: 0
  })

  const timestampToHoursConversor = 1/3600000;
  // Defining 20% and 0.5% as factor to determine values as idle/loaded or unloaded respectively
  const loadedOrIdleFactor = 0.2;
  const unloadedFactor = 0.005;

  let maxLoadLimit = 0;
  let isLoadedOrIdleParameter = 0;
  let isUnloadedParameter = 0;

  let totalWorkedHours = 0;
  let totalHoursOff = 0;
  let totalHoursIdle = 0;
  let totalHoursUnloaded = 0;
  let totalHoursLoaded = 0;
  
  // Final data to show in graphic
  const dailyPumpInfo = {
    labels: ['Off', 'On - Unloaded', 'On - Idle', 'On - Loaded'],
    datasets: [
      {
        label: 'Hours',
        data: [
          data.totalHoursOff, 
          data.totalHoursUnloaded, 
          data.totalHoursIdle, 
          data.totalHoursLoaded
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)'
        ], 
        borderWidth: 1
      }
    ]
  }

  //Setting max value (maxLoadLimit) as reference to evaluate idle, loaded, and unloaded values  
  JsonData.forEach(element => {
    if(element.metrics.Psum.maxvalue && element.metrics.Psum.maxvalue > maxLoadLimit ) {
      maxLoadLimit = element.metrics.Psum.maxvalue;
      isLoadedOrIdleParameter = maxLoadLimit * loadedOrIdleFactor;
      isUnloadedParameter = maxLoadLimit * unloadedFactor;
    } 
  });
  
  //Processing average values to calculate off, on-unloaded, on-loaded, and on-idle hours
  JsonData.forEach(element => {
    if(element.metrics.Psum.avgvalue && element.tots && element.fromts) {
      const valueToEvaluate = element.metrics.Psum.avgvalue;
      const isUnloaded = valueToEvaluate <= isUnloadedParameter;
      const isLoaded = valueToEvaluate >= isLoadedOrIdleParameter;
      const workedTime = (element.tots - element.fromts) * timestampToHoursConversor;

      totalWorkedHours += workedTime;
      totalHoursOff = 24 - totalWorkedHours;

      isUnloaded ? totalHoursUnloaded += workedTime
      : isLoaded ? totalHoursLoaded += workedTime
      : totalHoursIdle += workedTime 
    }
  });
  
  useEffect(() => {
    setData({
      totalWorkedHours,
      totalHoursOff,
      totalHoursIdle,
      totalHoursUnloaded,
      totalHoursLoaded
    })
  }, [totalWorkedHours, totalHoursOff, totalHoursIdle, totalHoursUnloaded,totalHoursLoaded])

  return (
    <div className="App">
      <header className="App-header">
        <h4>Pump Daily Result (in hours)</h4>
        <p>Please hover the graphic's areas to see the values</p>
        <div className="Graphic-container">
          <Doughnut data={dailyPumpInfo}/>
        </div>
      </header>
    </div>
  );
}

export default App;
