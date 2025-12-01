"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MapPin, AlertTriangle, Users, Database, BarChart3, Shield, Map, Upload } from 'lucide-react';

export default function HomePage() {
  const [stats, setStats] = useState({
    settlements: 0,
    floodZones: 0,
    highRisk: 0,
    totalPopulation: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-6 py-24">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              Spatial Risk Analyzer
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Identify settlements located in high-risk flood zones using advanced Web GIS technology
            </p>
            <div className="flex gap-4">
              <Link 
                href="/Map" 
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                View Interactive Map
              </Link>
              <Link 
                href="/DataEntry" 
                className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
              >
                Manage Data
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-6 py-12 -mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={<MapPin className="w-8 h-8" />}
            title="Total Settlements"
            value={stats.settlements}
            color="blue"
          />
          <StatCard 
            icon={<AlertTriangle className="w-8 h-8" />}
            title="Flood Zones"
            value={stats.floodZones}
            color="red"
          />
          <StatCard 
            icon={<Users className="w-8 h-8" />}
            title="High Risk Settlements"
            value={stats.highRisk}
            color="orange"
          />
          <StatCard 
            icon={<Database className="w-8 h-8" />}
            title="Population at Risk"
            value={stats.totalPopulation?.toLocaleString() || '0'}
            color="purple"
          />
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<BarChart3 className="w-12 h-12" />}
            title="Spatial Analysis"
            description="Uses MySQL GIS functions to perform complex spatial queries and identify risk zones"
          />
          <FeatureCard
            icon={<Shield className="w-12 h-12" />}
            title="Risk Assessment"
            description="Categorize flood zones by risk level (HIGH, MEDIUM, LOW) and identify vulnerable settlements"
          />
          <FeatureCard
            icon={<Database className="w-12 h-12" />}
            title="Data Management"
            description="Easy data upload and management through phpMyAdmin integration"
          />
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            How It Works
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <StepCard 
                number="1"
                title="Data Upload"
                description="Upload flood zone polygons and settlement points through phpMyAdmin"
              />
              <StepCard 
                number="2"
                title="Spatial Query"
                description="MySQL GIS functions analyze spatial relationships using ST_Contains"
              />
              <StepCard 
                number="3"
                title="Visualization"
                description="Results displayed on interactive Leaflet maps with risk categorization"
              />
              <StepCard 
                number="4"
                title="Risk Report"
                description="Generate reports and export data for decision making"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="container mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <ActionCard
            icon={<Map className="w-8 h-8" />}
            title="View Map"
            description="Explore flood zones and settlements on interactive map"
            link="/Map"
            buttonText="Open Map"
            color="blue"
          />
          <ActionCard
            icon={<Upload className="w-8 h-8" />}
            title="Add Data"
            description="Upload new settlements or flood zone data"
            link="/DataEntry"
            buttonText="Upload Data"
            color="green"
          />
          <ActionCard
            icon={<Database className="w-8 h-8" />}
            title="Database"
            description="Access phpMyAdmin for advanced database management"
            link="http://localhost/phpmyadmin"
            buttonText="Open phpMyAdmin"
            color="purple"
            external={true}
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          Ready to Analyze Flood Risks?
        </h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Start identifying vulnerable settlements and plan effective disaster response strategies
        </p>
        <Link 
          href="/Map" 
          className="inline-block bg-blue-600 text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition"
        >
          Launch Risk Analyzer
        </Link>
      </div>
    </div>
  );
}

// StatCard Component
function StatCard({ icon, title, value, color }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className={`inline-flex p-3 rounded-lg ${colorClasses[color]} mb-4`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      <p className="text-gray-600">{title}</p>
    </div>
  );
}

// FeatureCard Component
function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition hover:-translate-y-1">
      <div className="text-blue-600 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

// StepCard Component
function StepCard({ number, title, description }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 hover:bg-blue-700 transition">
        {number}
      </div>
      <h4 className="text-lg font-bold mb-2 text-gray-800">{title}</h4>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

// ActionCard Component
function ActionCard({ icon, title, description, link, buttonText, color, external = false }) {
  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700'
  };

  const LinkComponent = external ? 'a' : Link;
  const linkProps = external ? { href: link, target: '_blank', rel: 'noopener noreferrer' } : { href: link };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition">
      <div className="text-blue-600 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <LinkComponent
        {...linkProps}
        className={`${colorClasses[color]} text-white px-4 py-2 rounded-lg font-medium inline-block transition`}
      >
        {buttonText}
      </LinkComponent>
    </div>
  );
}