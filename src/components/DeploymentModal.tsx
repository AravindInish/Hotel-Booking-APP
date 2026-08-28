import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  Copy, 
  Check, 
  ExternalLink, 
  FileSpreadsheet, 
  Code, 
  Sparkles, 
  ShieldCheck,
  Server
} from 'lucide-react';

interface DeploymentModalProps {
  onClose: () => void;
}

export const DeploymentModal: React.FC<DeploymentModalProps> = ({ onClose }) => {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const copyToClipboard = (text: string, stepIndex: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepIndex);
    setTimeout(() => setCopiedStep(null), 2500);
  };

  const steps = [
    {
      title: 'Step 1: Create a Google Spreadsheet',
      desc: 'Open Google Sheets (sheets.new) and name it "AI Hotels & Rooms Database". Note the Spreadsheet ID from your browser URL (the long string between /d/ and /edit).',
      code: 'https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID_HERE/edit'
    },
    {
      title: 'Step 2: Open Apps Script Editor',
      desc: 'Inside your Google Sheet, click Extensions → Apps Script. This opens the Google Apps Script IDE in your browser.',
      code: 'Extensions > Apps Script'
    },
    {
      title: 'Step 3: Paste Backend Code (Code.gs)',
      desc: 'Replace the default code in Code.gs with the complete backend script from this project (included in Code.gs).',
      code: '// File: Code.gs in root directory of this project'
    },
    {
      title: 'Step 4: Set Script Properties & Initialize Database',
      desc: 'In Project Settings (Gear icon) → Script Properties, add SPREADSHEET_ID and JWT_SECRET. Then run the initializeDatabase() function once in the editor to auto-generate all 6 Sheets (Users, Hotels, Rooms, Bookings, Payments, Reviews).',
      code: 'Key: SPREADSHEET_ID  |  Value: <Your Google Sheet ID>\nKey: JWT_SECRET       |  Value: <Secret-Key-128bit>'
    },
    {
      title: 'Step 5: Deploy as Web App',
      desc: 'Click Deploy → New Deployment → Select type "Web app". Set "Execute as: Me" and "Who has access: Anyone". Copy the generated Web App URL.',
      code: 'Deploy > New deployment > Select type: Web app\n- Execute as: Me\n- Who has access: Anyone'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-3xl bg-[#0a0a0a] rounded-sm border border-[#262626] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#262626] bg-[#0a0a0a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-[#141414] border border-[#262626] flex items-center justify-center text-[#C5A059]">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif-luxury text-lg font-bold text-white">
                Google Apps Script & Sheets Deployment Guide
              </h2>
              <div className="text-[11px] text-[#888888]">
                Production Web App Architecture • Zero-Cost Cloud Hosting
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-sm bg-[#141414] border border-[#262626] text-[#888888] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#0a0a0a]">
          
          <div className="p-4 rounded-sm bg-[#141414] border border-[#262626] flex items-start gap-3.5">
            <Sparkles className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
            <div className="text-xs text-[#888888] leading-relaxed">
              <strong className="text-white">AI Hotels & Rooms</strong> is designed to run seamlessly as a standalone single-page application or embedded directly within Google Workspace. Follow these 5 quick steps to connect your live Google Sheets backend.
            </div>
          </div>

          {/* Step Cards */}
          <div className="space-y-4">
            {steps.map((step, idx) => (
              <div key={idx} className="p-4 rounded-sm bg-[#141414] border border-[#262626] space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-sm bg-[#0a0a0a] border border-[#262626] text-[#C5A059] flex items-center justify-center text-[10px] font-mono font-bold">
                      {idx + 1}
                    </span>
                    <span>{step.title}</span>
                  </h3>
                </div>

                <p className="text-xs text-[#888888] pl-7 leading-relaxed">
                  {step.desc}
                </p>

                <div className="ml-7 mt-2 p-3 rounded-sm bg-[#0a0a0a] border border-[#262626] font-mono text-[11px] text-[#C5A059] flex items-center justify-between">
                  <span className="truncate pr-2">{step.code}</span>
                  <button
                    onClick={() => copyToClipboard(step.code, idx)}
                    className="px-2.5 py-1 rounded-sm bg-[#141414] hover:bg-[#1a1a1a] text-white text-[10px] uppercase tracking-wider font-semibold border border-[#262626] flex items-center gap-1 shrink-0 transition-colors"
                  >
                    {copiedStep === idx ? <Check className="w-3 h-3 text-[#C5A059]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedStep === idx ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Apps Script API Note */}
          <div className="p-4 rounded-sm bg-[#141414] border border-[#262626] text-xs text-[#888888] space-y-1">
            <div className="font-bold text-white uppercase tracking-wider text-[11px]">How the Frontend connects to Google Apps Script:</div>
            <p>
              When loaded inside Google Apps Script Web App environment, the app uses native <code className="text-[#C5A059] font-mono">google.script.run.apiHandler()</code>. In local preview, it utilizes the instant reactive in-memory bridge with identical SHA256 hashing and sheet replication for rapid testing.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
