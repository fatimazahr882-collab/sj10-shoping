"use client";

import React, { useState, useEffect, useMemo } from 'react';

const PAKISTANI_CITIES = [
  "Islamabad", "Karachi", "Lahore", "Rawalpindi", "Peshawar", "Quetta", 
  "Multan", "Faisalabad", "Gujranwala", "Sialkot", "Hyderabad", "Sukkur", "Bahawalpur", "Chakwal"
];

const COURIER_SERVICES = [
  { id: 'leopards', name: 'Leopards Courier', price: 'PKR 165', days: '2 - 3 Days', color: '#d97706', bg: '#fef3c7', icon: 'fa-truck-fast' },
  { id: 'postex', name: 'PostEx Express', price: 'PKR 165', days: '2 - 3 Days', color: '#0f172a', bg: '#f1f5f9', icon: 'fa-box' },
  { id: 'tcs', name: 'TCS Express', price: 'PKR 200', days: '1 - 2 Days', color: '#dc2626', bg: '#fee2e2', icon: 'fa-paper-plane' },
  { id: 'pkpost', name: 'Pakistan Post', price: 'PKR 185', days: '3 - 4 Days', color: '#0284c7', bg: '#e0f2fe', icon: 'fa-envelope-open-text' },
];

export default function ProductDelivery({ warranty, showToast }: { warranty?: any, showToast?: any }) {
  const [deliveryCity, setDeliveryCity] = useState("Islamabad");
  const [detailedLocation, setDetailedLocation] = useState("Detecting your location...");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [showAllOptions, setShowAllOptions] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState('leopards');

  // 🟢 SMART WARRANTY PARSER (Clean Display)
  const formattedWarranty = useMemo(() => {
    if (!warranty) return "No Warranty Available";
    
    try {
      let data = warranty;
      if (typeof warranty === 'string') {
        const trimmed = warranty.trim();
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
          data = JSON.parse(trimmed);
        }
      }

      if (typeof data === 'object' && data !== null) {
        const typeStr = data.type ? `${data.type.replace(/([0-9]+)/, '$1 ')} Warranty` : '';
        const infoStr = data.info ? `(${data.info.trim()})` : '';
        const combined = `${typeStr} ${infoStr}`.trim();
        if (combined && combined !== "Warranty ()" && combined !== "Warranty") {
          return combined;
        }
      }
    } catch (e) {}

    const strWarranty = String(warranty);
    if (strWarranty.includes('{') || strWarranty.includes('}')) {
      return "No Warranty Available";
    }

    return strWarranty || "No Warranty Available";
  }, [warranty]);

  const estimatedDateRange = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + 3);
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 5);

    const formatOpts: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };
    return `${startDate.toLocaleDateString('en-US', formatOpts)} - ${endDate.toLocaleDateString('en-US', formatOpts)}`;
  }, []);

  useEffect(() => {
    const autoDetectLocation = async () => {
      setIsDetectingLocation(true);
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
              const data = await res.json();
              if (data && data.address) {
                const city = data.address.city || data.address.town || data.address.county || data.address.state_district || "";
                const state = data.address.state || "";
                const suburb = data.address.suburb || data.address.neighbourhood || data.address.residential || "";

                const matchedCity = PAKISTANI_CITIES.find(c => c.toLowerCase() === city.toLowerCase());
                if (matchedCity) setDeliveryCity(matchedCity);

                const fullLoc = [suburb, city, state, "Pakistan"].filter(Boolean).join(', ');
                setDetailedLocation(fullLoc || `${city}, ${state}`);
              } else {
                fallbackToIp();
              }
            } catch (e) {
              fallbackToIp();
            } finally {
              setIsDetectingLocation(false);
            }
          },
          () => { fallbackToIp(); },
          { timeout: 6000 }
        );
      } else {
        fallbackToIp();
      }
    };

    const fallbackToIp = async () => {
      try {
        const res = await fetch('https://ipinfo.io/json/');
        const data = await res.json();
        if (data && data.city) {
          const matchedCity = PAKISTANI_CITIES.find(c => c.toLowerCase() === data.city.toLowerCase());
          if (matchedCity) setDeliveryCity(matchedCity);
          setDetailedLocation(`${data.city}, ${data.region || 'Pakistan'}`);
        } else {
          setDetailedLocation("Islamabad, Punjab, Pakistan");
        }
      } catch (e) {
        setDetailedLocation("Islamabad, Punjab, Pakistan");
      } finally {
        setIsDetectingLocation(false);
      }
    };

    autoDetectLocation();
  }, []);

  const manualDetect = () => {
    setIsDetectingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            if (data && data.address) {
              const city = data.address.city || data.address.town || data.address.county || "";
              const state = data.address.state || "";
              const suburb = data.address.suburb || data.address.neighbourhood || "";
              const matchedCity = PAKISTANI_CITIES.find(c => c.toLowerCase() === city.toLowerCase());
              if (matchedCity) setDeliveryCity(matchedCity);
              setDetailedLocation([suburb, city, state, "Pakistan"].filter(Boolean).join(', '));
              showToast?.("Exact Location Captured!", "fa-map-marker-alt", "#00b862");
            }
          } catch (e) {} finally { setIsDetectingLocation(false); }
        },
        () => { setIsDetectingLocation(false); }
      );
    }
  };

  const displayedCouriers = showAllOptions ? COURIER_SERVICES : COURIER_SERVICES.slice(0, 2);

  return (
    <div className="pro-delivery-card">
      {/* Header */}
      <div className="pd-header">
        <div className="pd-header-title">
          <i className="fas fa-truck-fast pd-icon-green" aria-hidden="true"></i>
          <span>Delivery Information</span>
        </div>
        
        {/* 🟢 FIXED: Added aria-label for accessibility */}
        <button 
          className="pd-re-detect-btn" 
          onClick={manualDetect} 
          disabled={isDetectingLocation}
          aria-label="Refresh GPS Location"
        >
          <i className={isDetectingLocation ? "fas fa-spinner fa-spin" : "fas fa-location-crosshairs"} aria-hidden="true"></i>
          {isDetectingLocation ? 'Locating...' : 'GPS Refresh'}
        </button>
      </div>

      {/* Address Box */}
      <div className="pd-address-box">
        <div className="pd-address-top">
          {/* 🟢 FIXED: Linked label with input via htmlFor */}
          <label htmlFor="city-selector" className="pd-lbl">Deliver To:</label>
          <div className="pd-select-wrapper">
            {/* 🟢 FIXED: Added id and aria-label */}
            <select 
              id="city-selector"
              aria-label="Select Delivery City"
              className="pd-city-select" 
              value={deliveryCity} 
              onChange={(e) => {
                setDeliveryCity(e.target.value);
                setDetailedLocation(`${e.target.value}, Punjab, Pakistan`);
              }}
            >
              {PAKISTANI_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
            <i className="fas fa-chevron-down pd-select-arrow" aria-hidden="true"></i>
          </div>
        </div>
        <div className="pd-address-full">
          <i className="fas fa-map-marker-alt pd-pin" aria-hidden="true"></i>
          <span>{detailedLocation}</span>
        </div>
      </div>

      {/* Estimated Date */}
      <div className="pd-est-row">
        <i className="far fa-calendar-check pd-cal-icon" aria-hidden="true"></i>
        <div>
          <span className="pd-lbl-est">Get It By: </span>
          <span className="pd-date-highlight">{estimatedDateRange}</span>
        </div>
      </div>

      <div className="pd-divider"></div>

      {/* Couriers List */}
      <div className="pd-couriers-title">Available Delivery Partners</div>

      <div className="pd-courier-list">
        {displayedCouriers.map((c) => {
          const isSelected = selectedCourier === c.id;
          return (
            <div 
              key={c.id} 
              className={`pd-courier-item ${isSelected ? 'selected-partner' : ''}`}
              onClick={() => setSelectedCourier(c.id)}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedCourier(c.id);
                }
              }}
            >
              <div className="pd-c-left">
                <div className="pd-c-badge" style={{ backgroundColor: c.bg, color: c.color }}>
                  <i className={`fas ${c.icon}`} aria-hidden="true"></i>
                </div>
                <div className="pd-c-info">
                  <span className="pd-c-name">{c.name}</span>
                  <span className="pd-c-days">{c.days}</span>
                </div>
              </div>
              <div className="pd-c-right">
                <span className="pd-c-price">{c.price}</span>
                <div className={`pd-radio-circle ${isSelected ? 'active' : ''}`}></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🟢 FIXED: Added aria-expanded and descriptive label */}
      <button 
        className="pd-toggle-btn" 
        onClick={() => setShowAllOptions(!showAllOptions)}
        aria-expanded={showAllOptions}
        aria-label={showAllOptions ? "Show fewer courier options" : "View all courier options"}
      >
        <span>{showAllOptions ? "Show fewer options" : "View all 4 courier options"}</span>
        <i className={`fas fa-arrow-right pd-arrow-slide ${showAllOptions ? 'rotate-up' : ''}`} aria-hidden="true"></i>
      </button>

      {/* Warranty Footer Badge */}
      <div className="pd-warranty-box">
        <i className="fas fa-shield-halved pd-shield" aria-hidden="true"></i>
        <div>
          <span className="pd-w-lbl">Warranty Details: </span>
          <strong className="pd-w-val">{formattedWarranty}</strong>
        </div>
      </div>

      <style jsx>{`
        .pro-delivery-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 22px;
          margin-bottom: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
          font-family: 'Inter', -apple-system, sans-serif;
        }

        .pd-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .pd-header-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
        }

        .pd-icon-green { color: #00b862; font-size: 18px; }

        .pd-re-detect-btn {
          background: #f0fdf4; color: #00b862; border: 1px solid #bbf7d0;
          padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s;
        }
        .pd-re-detect-btn:hover { background: #00b862; color: #ffffff; }

        .pd-address-box { background: #f8fafc; border: 1px solid #f1f5f9; padding: 14px 16px; border-radius: 12px; margin-bottom: 14px; }
        .pd-address-top { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
        .pd-lbl { font-size: 13px; color: #64748b; font-weight: 600; }

        .pd-select-wrapper { position: relative; display: inline-flex; align-items: center; }
        .pd-city-select {
          border: none; background: transparent; font-size: 14px; font-weight: 800;
          color: #0f172a; cursor: pointer; outline: none; padding-right: 18px; appearance: none;
        }
        .pd-select-arrow { position: absolute; right: 0; font-size: 10px; color: #0f172a; pointer-events: none; }

        .pd-address-full { font-size: 13px; color: #1e293b; font-weight: 600; display: flex; align-items: center; gap: 8px; margin-top: 4px; }
        .pd-pin { color: #ef4444; font-size: 14px; }

        .pd-est-row {
          display: flex; align-items: center; gap: 10px; font-size: 13px;
          background: #ecfdf5; border: 1px solid #a7f3d0; padding: 12px 16px;
          border-radius: 12px; color: #065f46; margin-bottom: 16px;
        }

        .pd-cal-icon { font-size: 18px; color: #059669; }
        .pd-lbl-est { font-weight: 600; color: #065f46; }
        .pd-date-highlight { font-weight: 800; color: #064e3b; }

        .pd-divider { height: 1px; background: #f1f5f9; margin: 18px 0; }
        .pd-services-title { font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }

        .pd-courier-list { display: flex; flex-direction: column; gap: 10px; }
        
        .pd-courier-item {
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px 16px; background: #ffffff; border-radius: 12px; border: 1.5px solid #e2e8f0;
          cursor: pointer; transition: all 0.2s ease;
        }
        .pd-courier-item:hover, .pd-courier-item:focus { border-color: #cbd5e1; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.03); outline: none; }
        .pd-courier-item.selected-partner { border-color: #00b862; background: #f0fdf4; }

        .pd-c-left { display: flex; align-items: center; gap: 12px; }
        .pd-c-badge { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 15px; }
        .pd-c-info { display: flex; flex-direction: column; gap: 2px; }
        .pd-c-name { font-size: 13.5px; font-weight: 800; color: #0f172a; }
        .pd-c-days { font-size: 11px; color: #64748b; font-weight: 500; }
        
        .pd-c-right { display: flex; align-items: center; gap: 12px; }
        .pd-c-price { font-size: 13.5px; font-weight: 800; color: #0f172a; }

        .pd-radio-circle {
          width: 18px; height: 18px; border-radius: 50%; border: 2px solid #cbd5e1;
          position: relative; transition: all 0.2s;
        }
        .pd-radio-circle.active { border-color: #00b862; background: #00b862; }
        .pd-radio-circle.active::after {
          content: ''; position: absolute; top: 4px; left: 4px; width: 6px; height: 6px;
          border-radius: 50%; background: white;
        }

        .pd-toggle-btn {
          background: #f8fafc; border: 1px solid #e2e8f0; color: #00b862;
          font-size: 12px; font-weight: 800; cursor: pointer; padding: 10px 16px;
          border-radius: 10px; margin-top: 14px; width: 100%; display: flex;
          align-items: center; justify-content: center; gap: 8px; transition: all 0.2s;
        }
        .pd-toggle-btn:hover, .pd-toggle-btn:focus { background: #f0fdf4; border-color: #bbf7d0; outline: none; }
        .pd-arrow-slide { transition: transform 0.2s; }
        .pd-toggle-btn:hover .pd-arrow-slide { transform: translateX(3px); }
        .pd-arrow-slide.rotate-up { transform: rotate(-90deg); }

        .pd-warranty-box { margin-top: 18px; padding-top: 14px; border-top: 1px dashed #e2e8f0; font-size: 12px; color: #475569; display: flex; align-items: center; gap: 10px; }
        .pd-shield { color: #00b862; font-size: 16px; }
        .pd-w-lbl { color: #64748b; font-weight: 600; }
        .pd-w-val { color: #0f172a; font-weight: 800; }
      `}</style>
    </div>
  );
}