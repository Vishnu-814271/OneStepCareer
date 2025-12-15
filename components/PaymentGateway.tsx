import React, { useState } from 'react';
import { User } from '../types';
import { CreditCard, CheckCircle, ShieldCheck, Zap, Smartphone, QrCode, Copy, Clock, AlertTriangle } from 'lucide-react';
import { dataService } from '../services/dataService';

interface PaymentGatewayProps {
  user: User;
  onPaymentComplete: (updatedUser: User) => void;
  onLogout?: () => void; // Optional prop to allow logout from waiting screen
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({ user, onPaymentComplete, onLogout }) => {
  const [selectedPlan, setSelectedPlan] = useState<'STUDENT' | 'PROFESSIONAL'>('STUDENT');
  const [step, setStep] = useState<'PLAN_SELECTION' | 'UPI_PAYMENT'>('PLAN_SELECTION');
  const [isProcessing, setIsProcessing] = useState(false);

  const UPI_ID = "8142712925@hdfcbank";
  const AMOUNT = selectedPlan === 'STUDENT' ? 249 : 349;

  // Handle case where user is already pending
  if (user.paymentStatus === 'PENDING_APPROVAL') {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#050b14]/90 backdrop-blur-md p-4 animate-fade-in">
        <div className="bg-[#0f172a] border border-slate-700 w-full max-w-md rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
             <Clock size={40} className="text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Verification Pending</h2>
          <p className="text-slate-400 mb-6">
            Your payment details have been submitted. An administrator will verify the transaction with the bank and approve your account shortly.
          </p>
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 mb-6 text-sm text-left">
             <div className="flex justify-between mb-2">
               <span className="text-slate-500">Account:</span>
               <span className="text-white">{user.email}</span>
             </div>
             <div className="flex justify-between">
               <span className="text-slate-500">Status:</span>
               <span className="text-yellow-400 font-bold flex items-center gap-1"><Clock size={12}/> Awaiting Approval</span>
             </div>
          </div>
          <p className="text-xs text-slate-500 mb-6">Please check back later.</p>
          <button 
             onClick={() => window.location.reload()} 
             className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold transition-colors"
          >
             Refresh Status
          </button>
          {onLogout && (
             <button onClick={onLogout} className="mt-4 text-xs text-slate-500 hover:text-red-400">Sign Out</button>
          )}
        </div>
      </div>
    );
  }

  const handleVerifyPayment = () => {
    setIsProcessing(true);
    // Submit request to admin
    setTimeout(() => {
      const updatedUser = dataService.submitPaymentRequest(user.id, selectedPlan);
      if (updatedUser) {
        // We do not call onPaymentComplete immediately because isPaid is still false
        // Instead we force a re-render to show the PENDING_APPROVAL state
        // By calling onPaymentComplete with the updated pending user, the parent (BookAuth) handles it.
        onPaymentComplete(updatedUser);
      }
    }, 2000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(UPI_ID);
    alert("UPI ID copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#050b14]/90 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-[#0f172a] border border-slate-700 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[500px]">
        
        {/* Left Side - Info */}
        <div className="md:w-1/3 bg-gradient-to-br from-indigo-900 to-slate-900 p-8 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Complete Enrollment</h2>
            <p className="text-indigo-200 mb-6">Unlock full access to TechNexus Academy's premium coding labs, AI tutor, and certification tracks.</p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-400" /> Unlimited Code Executions</li>
              <li className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-400" /> 24/7 AI Tutor Assistance</li>
              <li className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-400" /> Industry Recognized Certificates</li>
            </ul>
          </div>
          <div className="relative z-10 mt-8 flex items-center gap-2 text-xs text-indigo-300">
             <ShieldCheck size={14} />
             Secure UPI Payment
          </div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
        </div>

        {/* Right Side - Flow */}
        <div className="flex-1 p-8 bg-[#0f172a] flex flex-col">
          
          {step === 'PLAN_SELECTION' && (
            <div className="animate-fade-in flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <CreditCard className="text-cyan-400" /> Select a Plan
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {/* Student Plan */}
                <div 
                  onClick={() => setSelectedPlan('STUDENT')}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${selectedPlan === 'STUDENT' ? 'border-cyan-500 bg-cyan-900/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Student</span>
                    {selectedPlan === 'STUDENT' && <CheckCircle size={20} className="text-cyan-500" />}
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">₹249<span className="text-sm text-slate-500 font-normal">/year</span></div>
                  <p className="text-xs text-slate-400">For university students.</p>
                </div>

                {/* Professional Plan */}
                <div 
                  onClick={() => setSelectedPlan('PROFESSIONAL')}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${selectedPlan === 'PROFESSIONAL' ? 'border-violet-500 bg-violet-900/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-violet-400 uppercase tracking-wider">All Access</span>
                    {selectedPlan === 'PROFESSIONAL' && <CheckCircle size={20} className="text-violet-500" />}
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">₹349<span className="text-sm text-slate-500 font-normal">/year</span></div>
                  <p className="text-xs text-slate-400">For professionals.</p>
                </div>
              </div>

              <div className="mt-auto border-t border-slate-700 pt-6">
                <button 
                  onClick={() => setStep('UPI_PAYMENT')}
                  className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                >
                  Proceed to Payment
                  <Zap size={20} fill="currentColor" />
                </button>
              </div>
            </div>
          )}

          {step === 'UPI_PAYMENT' && (
             <div className="animate-fade-in flex-1 flex flex-col items-center text-center">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <Smartphone className="text-cyan-400" /> Scan & Pay
                </h3>
                <p className="text-slate-400 mb-6">Complete your payment of <strong className="text-white">₹{AMOUNT}</strong> via UPI</p>

                <div className="bg-white p-4 rounded-xl shadow-xl mb-6 relative group">
                   {/* QR Code Placeholder */}
                   <div className="w-48 h-48 bg-slate-100 flex items-center justify-center border-2 border-slate-200 rounded-lg">
                      <QrCode size={100} className="text-slate-800" />
                   </div>
                   <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                      <p className="text-white font-bold text-sm">Scan with any UPI App</p>
                   </div>
                </div>

                <div className="w-full max-w-sm bg-slate-800/50 border border-slate-700 p-4 rounded-xl mb-6">
                   <p className="text-xs text-slate-500 uppercase font-bold mb-1">Pay to UPI ID</p>
                   <div className="flex items-center justify-between gap-2">
                      <code className="text-lg text-cyan-400 font-mono select-all">{UPI_ID}</code>
                      <button onClick={copyToClipboard} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors" title="Copy UPI ID">
                        <Copy size={16} />
                      </button>
                   </div>
                </div>

                <div className="mt-auto w-full border-t border-slate-700 pt-6">
                   <p className="text-xs text-slate-500 mb-4">Click below after you have successfully completed the transaction.</p>
                   <button 
                     onClick={handleVerifyPayment}
                     disabled={isProcessing}
                     className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                   >
                     {isProcessing ? (
                       <>
                         <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                         Submitting...
                       </>
                     ) : (
                       <>
                         <CheckCircle size={20} />
                         I Have Made the Payment
                       </>
                     )}
                   </button>
                   <button 
                      onClick={() => setStep('PLAN_SELECTION')}
                      disabled={isProcessing}
                      className="mt-3 text-sm text-slate-500 hover:text-white"
                   >
                      Back to Plans
                   </button>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;