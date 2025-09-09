
import React, { useState, useCallback } from 'react';
import { getFullEnergyAnalysis } from './services/geminiService';
import type { ApplianceAnalysis, FullAnalysisResponse } from './types';
import LoadingSpinner from './components/LoadingSpinner';
import RenewableForecastChart from './components/RenewableForecastChart';
import { BoltIcon, SunIcon, WindIcon, SavingsIcon, UploadIcon, LocationIcon, LightbulbIcon, CheckCircleIcon } from './components/IconComponents';

const INITIAL_CSV_DATA = `Hour,Consumption(kWh)
0,0.5
1,0.4
2,0.4
3,0.3
4,0.3
5,0.8
6,1.5
7,2.5
8,2.2
9,1.8
10,1.5
11,1.4
12,1.6
13,1.5
14,1.7
15,1.9
16,2.8
17,3.5
18,4.2
19,3.8
20,3.2
21,2.5
22,1.5
23,0.8
`;

const ApplianceCard: React.FC<{ analysis: ApplianceAnalysis }> = ({ analysis }) => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
        <div className="p-6">
            <div className="flex items-center">
                <div className="flex-shrink-0 bg-brand-green-light p-3 rounded-full">
                    <LightbulbIcon className="h-6 w-6 text-brand-green-dark" />
                </div>
                <h3 className="ml-4 text-xl font-bold text-text-primary tracking-wide">{analysis.appliance}</h3>
            </div>
            <div className="mt-4 space-y-3">
                <div className="flex items-center text-text-secondary">
                    <BoltIcon className="h-5 w-5 mr-3 text-brand-blue" />
                    <span>Est. Consumption: <strong className="text-text-primary">{analysis.estimatedConsumption} kWh/month</strong></span>
                </div>
                <div className="flex items-center text-text-secondary">
                    <SavingsIcon className="h-5 w-5 mr-3 text-brand-green" />
                    <span>Potential Savings: <strong className="text-brand-green-dark">${analysis.potentialSavings.cost.toFixed(2)}/month</strong> ({analysis.potentialSavings.kWh} kWh)</span>
                </div>
            </div>
            <p className="mt-4 text-text-secondary bg-base-200 p-3 rounded-lg">{analysis.recommendation}</p>
        </div>
    </div>
);


const App: React.FC = () => {
  const [location, setLocation] = useState<string>('Nairobi, Kenya');
  const [consumptionData, setConsumptionData] = useState<{ type: 'csv'; data: string } | { type: 'image'; data: string; mimeType: string } | null>({
    type: 'csv',
    data: INITIAL_CSV_DATA,
  });
  const [fileName, setFileName] = useState<string>('sample-data.csv');
  const [fullAnalysis, setFullAnalysis] = useState<FullAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        
        const handleReadError = () => {
            setError("Failed to read the file.");
            setConsumptionData({ type: 'csv', data: INITIAL_CSV_DATA });
            setFileName('sample-data.csv');
        };

        reader.onerror = handleReadError;

        if (file.type.startsWith('image/')) {
            reader.onload = (e) => {
                const result = e.target?.result as string;
                const base64Data = result ? result.split(',')[1] : undefined;
                if (base64Data) {
                    setConsumptionData({ type: 'image', data: base64Data, mimeType: file.type });
                    setFileName(file.name);
                    setError(null);
                } else {
                    handleReadError();
                }
            };
            reader.readAsDataURL(file);
        } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
            reader.onload = (e) => {
                const text = e.target?.result as string;
                setConsumptionData({ type: 'csv', data: text });
                setFileName(file.name);
                setError(null);
            };
            reader.readAsText(file);
        } else {
            setError("Unsupported file type. Please upload a CSV or an image (JPEG, PNG, WEBP).");
        }
    }
  };

  const handleAnalysis = useCallback(async () => {
    if (!location || !consumptionData) {
      setError('Please provide a location and your consumption data (CSV or bill image).');
      return;
    }

    setIsLoading(true);
    setError(null);
    setFullAnalysis(null);
    

    try {
      const result = await getFullEnergyAnalysis(consumptionData, location);
      setFullAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [location, consumptionData]);
  
  return (
    <div className="min-h-screen bg-base-200 text-text-primary">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
            <BoltIcon className="h-10 w-10 text-brand-green" />
            <h1 className="ml-3 text-3xl font-bold tracking-tight text-text-primary">E-Power</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
            <h2 className="text-2xl font-bold mb-4">Get Your Personalized Energy Analysis</h2>
            <p className="text-text-secondary mb-6">Upload your smart meter data (CSV) or a picture of your bill to receive AI-powered recommendations.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div className="md:col-span-1">
                    <label htmlFor="file-upload-label" className="flex items-center text-sm font-medium text-text-secondary mb-2">
                      <UploadIcon className="w-5 h-5 mr-2" />
                      Smart Meter Data or Bill Image
                    </label>
                    <label htmlFor="file-upload" className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-base-300 border-dashed rounded-md bg-base-100 hover:border-brand-blue transition-colors cursor-pointer">
                        <div className="space-y-1 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                            <div className="flex text-sm text-gray-600"><p className="pl-1 truncate font-medium text-brand-blue">{fileName}</p></div>
                            <p className="text-xs text-gray-500">CSV, PNG, JPG, WEBP accepted</p>
                        </div>
                    </label>
                    <input id="file-upload" type="file" className="hidden" accept=".csv,image/png,image/jpeg,image/webp" onChange={handleFileChange} />
                </div>

                <div className="md:col-span-1">
                    <label htmlFor="location" className="flex items-center text-sm font-medium text-text-secondary mb-2">
                      <LocationIcon className="w-5 h-5 mr-2" />
                      Your Location
                    </label>
                    <input
                        type="text"
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-4 py-3 rounded-md border-base-300 focus:ring-brand-blue focus:border-brand-blue transition duration-150 ease-in-out shadow-sm"
                        placeholder="e.g., Nairobi, Kenya; Lagos, Nigeria"
                    />
                </div>

                <button
                    onClick={handleAnalysis}
                    disabled={isLoading || !consumptionData || !location}
                    className="w-full md:col-span-1 bg-brand-green hover:bg-brand-green-dark text-white font-bold py-3 px-4 rounded-md shadow-lg transform hover:-translate-y-0.5 transition-all duration-150 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading ? 'Analyzing...' : 'Analyze My Energy'}
                </button>
            </div>
            {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>

        {isLoading && <LoadingSpinner message="Our AI is analyzing your data... this may take a moment." />}

        {fullAnalysis && (
          <div className="space-y-12">
            
            {/* Action Plan Section */}
            <div className="bg-brand-green-light/20 border-l-4 border-brand-green-dark p-6 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold mb-4 text-brand-green-dark">Your Action Plan</h2>
                <p className="text-text-secondary mb-6">Here are the top recommendations from our AI to help you start saving immediately:</p>
                <ul className="space-y-4">
                    {fullAnalysis.actionPlan.map((step, index) => (
                        <li key={index} className="flex items-start">
                            <CheckCircleIcon className="h-6 w-6 text-brand-green-dark mr-4 flex-shrink-0 mt-1" />
                            <p className="text-text-primary">{step}</p>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Load Estimator Section */}
            <div>
              <h2 className="text-3xl font-bold mb-6 text-text-primary">AI Load Estimator Results</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {fullAnalysis.applianceAnalysis.map((item, index) => (
                  <ApplianceCard key={index} analysis={item} />
                ))}
              </div>
            </div>

            {/* Renewables Section */}
            <div>
                <h2 className="text-3xl font-bold mb-2 text-text-primary">Renewables Integration</h2>
                <div className="flex items-center text-xl mb-6 bg-blue-100 text-brand-blue-dark p-4 rounded-lg shadow">
                    {fullAnalysis.renewableAnalysis.bestOption === 'solar' ? 
                      <SunIcon className="h-8 w-8 mr-4 text-yellow-500" /> : 
                      <WindIcon className="h-8 w-8 mr-4 text-blue-500" />
                    }
                    <p>For <strong>{location}</strong>, <strong className="capitalize">{fullAnalysis.renewableAnalysis.bestOption}</strong> is the most promising renewable source.</p>
                </div>
                
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <h3 className="text-2xl font-semibold mb-4">48-Hour Availability Forecast</h3>
                        <RenewableForecastChart data={fullAnalysis.renewableAnalysis.forecast} type={fullAnalysis.renewableAnalysis.bestOption} />
                    </div>
                    <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md">
                        <h3 className="text-2xl font-semibold mb-4">Usage Recommendations</h3>
                        <ul className="space-y-4">
                            {fullAnalysis.renewableAnalysis.recommendations.map((rec, index) => (
                                <li key={index} className="flex">
                                    <div className="flex-shrink-0">
                                        <div className="w-6 h-6 rounded-full bg-brand-green flex items-center justify-center text-white font-bold text-sm">
                                            {index + 1}
                                        </div>
                                    </div>
                                    <p className="ml-4 text-text-secondary">{rec}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
