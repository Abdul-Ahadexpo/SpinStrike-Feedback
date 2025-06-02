import React, { useState, useEffect } from 'react';
import { ref, get, push, set, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../../firebase/config';
import { QrCode, Copy, Check, Share2, Trash2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

interface FeedbackCode {
  id: string;
  code: string;
  employeeId: string;
  customerName: string;
  customerNumber: string;
  used: boolean;
  createdAt: number;
}

const FeedbackCodes: React.FC = () => {
  const { currentUser } = useAuth();
  const [codes, setCodes] = useState<FeedbackCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState('');
  const [customerNumber, setCustomerNumber] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Fetch feedback codes
  const fetchCodes = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    
    try {
      const codesRef = query(
        ref(database, 'codes'),
        orderByChild('employeeId'),
        equalTo(currentUser.id)
      );
      
      const snapshot = await get(codesRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const codesList: FeedbackCode[] = [];
        
        Object.keys(data).forEach(key => {
          codesList.push({
            id: key,
            ...data[key]
          });
        });
        
        // Sort by creation date (newest first)
        codesList.sort((a, b) => b.createdAt - a.createdAt);
        
        setCodes(codesList);
      } else {
        setCodes([]);
      }
    } catch (error) {
      console.error('Error fetching feedback codes:', error);
      toast.error('Failed to load feedback codes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, [currentUser]);

  // Generate a new feedback code
  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName || !customerNumber) {
      toast.error('Please enter both customer name and number');
      return;
    }
    
    setGenerating(true);
    
    try {
      // Generate a random 6-character code
      const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      
      // Save the code to the database
      const newCodeRef = push(ref(database, 'codes'));
      await set(newCodeRef, {
        code,
        employeeId: currentUser?.id,
        employeeName: currentUser?.name,
        customerName,
        customerNumber,
        used: false,
        createdAt: Date.now()
      });
      
      toast.success('Feedback code generated successfully');
      setCustomerName('');
      setCustomerNumber('');
      fetchCodes();
    } catch (error) {
      console.error('Error generating feedback code:', error);
      toast.error('Failed to generate feedback code');
    } finally {
      setGenerating(false);
    }
  };

  // Copy feedback link to clipboard
  const copyToClipboard = (code: string) => {
    const url = `${window.location.origin}/feedback/${code}`;
    navigator.clipboard.writeText(url);
    setCopied(code);
    toast.success('Feedback link copied to clipboard');
    
    setTimeout(() => {
      setCopied(null);
    }, 3000);
  };

  // Share feedback link
  const shareFeedbackLink = (code: string, customerName: string) => {
    const url = `${window.location.origin}/feedback/${code}`;
    const text = `Hello ${customerName}, please provide your feedback for our service: ${url}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'SpinStrike Feedback',
        text,
        url
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Share text copied to clipboard');
    }
  };

  // Delete a feedback code
  const handleDeleteCode = async (id: string, used: boolean) => {
    if (used) {
      toast.error('Cannot delete a used feedback code');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this feedback code?')) {
      return;
    }
    
    try {
      await set(ref(database, `codes/${id}`), null);
      toast.success('Feedback code deleted');
      fetchCodes();
    } catch (error) {
      console.error('Error deleting feedback code:', error);
      toast.error('Failed to delete feedback code');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Feedback Codes</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Generate Code Form */}
        <div className="md:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Generate New Code</h3>
            
            <form onSubmit={handleGenerateCode} className="space-y-4">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name
                </label>
                <input
                  id="customerName"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="input"
                  placeholder="Enter customer name"
                />
              </div>
              
              <div>
                <label htmlFor="customerNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Number
                </label>
                <input
                  id="customerNumber"
                  type="text"
                  value={customerNumber}
                  onChange={(e) => setCustomerNumber(e.target.value)}
                  className="input"
                  placeholder="Phone or reference #"
                />
              </div>
              
              <button
                type="submit"
                className="btn btn-primary w-full flex items-center justify-center"
                disabled={generating}
              >
                {generating ? (
                  <span className="flex items-center">
                    <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <QrCode className="h-4 w-4 mr-2" />
                    Generate Code
                  </span>
                )}
              </button>
            </form>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Generate a unique code for each customer to collect feedback.
                Each code can only be used once.
              </p>
            </div>
          </div>
        </div>
        
        {/* Codes List */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Your Codes ({codes.length})
            </h3>
            
            <button
              onClick={fetchCodes}
              className="flex items-center text-sm text-gray-600 hover:text-primary"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : codes.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No feedback codes generated yet.</p>
              <p className="text-sm text-gray-400">
                Generate a code for each customer to collect feedback.
              </p>
            </div>
          ) : (
            <div className="bg-white border rounded-lg overflow-hidden divide-y divide-gray-200">
              {codes.map((code) => (
                <div 
                  key={code.id} 
                  className={`p-4 transition-colors ${code.used ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <QrCode className={`h-5 w-5 mr-2 ${code.used ? 'text-gray-400' : 'text-primary'}`} />
                      <span className={`font-mono font-medium ${code.used ? 'text-gray-500' : 'text-gray-900'}`}>
                        {code.code}
                      </span>
                      {code.used && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full">
                          Used
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!code.used && (
                        <>
                          <button
                            onClick={() => copyToClipboard(code.code)}
                            className="p-1 text-gray-500 hover:text-primary"
                            title="Copy link"
                          >
                            {copied === code.code ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </button>
                          
                          <button
                            onClick={() => shareFeedbackLink(code.code, code.customerName)}
                            className="p-1 text-gray-500 hover:text-primary"
                            title="Share link"
                          >
                            <Share2 className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteCode(code.id, code.used)}
                            className="p-1 text-gray-500 hover:text-error"
                            title="Delete code"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Customer:</span> {code.customerName}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Number:</span> {code.customerNumber}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Created: {new Date(code.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackCodes;