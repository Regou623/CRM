import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Building2, Mail, Phone, Calendar, Plus, MessageSquare, Briefcase, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
}

interface Journey {
  id: string;
  date: string;
  type: string;
  notes: string;
  next_step: string;
  created_at: string;
}

export function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Journey form state
  const [showJourneyForm, setShowJourneyForm] = useState(false);
  const [journeyForm, setJourneyForm] = useState({
    date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    type: '拜访',
    notes: '',
    next_step: '',
  });
  const [submittingJourney, setSubmittingJourney] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCustomerDetails();
    }
  }, [id]);

  const fetchCustomerDetails = async () => {
    try {
      // Fetch customer
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (customerError) throw customerError;
      setCustomer(customerData);

      // Fetch journeys
      const { data: journeyData, error: journeyError } = await supabase
        .from('journeys')
        .select('*')
        .eq('customer_id', id)
        .order('date', { ascending: false });

      if (journeyError) throw journeyError;
      setJourneys(journeyData || []);
    } catch (error) {
      console.error('Error fetching details:', error);
      alert('加载客户信息失败');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleJourneySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;

    setSubmittingJourney(true);
    try {
      const { data, error } = await supabase
        .from('journeys')
        .insert([
          {
            customer_id: id,
            user_id: user.id,
            date: new Date(journeyForm.date).toISOString(),
            type: journeyForm.type,
            notes: journeyForm.notes,
            next_step: journeyForm.next_step,
          },
        ])
        .select();

      if (error) throw error;
      
      // Add to list
      if (data) {
        setJourneys([data[0], ...journeys].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
      
      // Reset form
      setShowJourneyForm(false);
      setJourneyForm({
        date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        type: '拜访',
        notes: '',
        next_step: '',
      });
    } catch (error) {
      console.error('Error adding journey:', error);
      alert('添加记录失败');
    } finally {
      setSubmittingJourney(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!window.confirm('确定要删除此客户吗？此操作不可恢复，且会删除所有相关的拜访记录。')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      navigate('/');
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('删除失败');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12">加载中...</div>;
  }

  if (!customer) {
    return <div className="text-center py-12">未找到客户信息</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
          <span className="ml-4 px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            {customer.status}
          </span>
        </div>
        <button
          onClick={handleDeleteCustomer}
          className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          删除客户
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Customer Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">基本信息</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Building2 className="w-4 h-4 mr-2" /> 公司
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{customer.company || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Mail className="w-4 h-4 mr-2" /> 邮箱
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {customer.email ? (
                    <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline">
                      {customer.email}
                    </a>
                  ) : '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Phone className="w-4 h-4 mr-2" /> 电话
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {customer.phone ? (
                    <a href={`tel:${customer.phone}`} className="text-blue-600 hover:underline">
                      {customer.phone}
                    </a>
                  ) : '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" /> 创建时间
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {format(new Date(customer.created_at), 'yyyy-MM-dd HH:mm')}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Right Column: Journeys / Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <h2 className="text-lg font-medium text-gray-900">客户旅程 / 拜访记录</h2>
              <button
                onClick={() => setShowJourneyForm(!showJourneyForm)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="mr-1 h-4 w-4" />
                {showJourneyForm ? '取消添加' : '添加记录'}
              </button>
            </div>

            {/* Add Journey Form */}
            {showJourneyForm && (
              <form onSubmit={handleJourneySubmit} className="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">时间</label>
                    <input
                      type="datetime-local"
                      required
                      value={journeyForm.date}
                      onChange={(e) => setJourneyForm({ ...journeyForm, date: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">类型</label>
                    <select
                      value={journeyForm.type}
                      onChange={(e) => setJourneyForm({ ...journeyForm, type: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="拜访">拜访 (Visit)</option>
                      <option value="会议">会议 (Meeting)</option>
                      <option value="电话">电话 (Call)</option>
                      <option value="邮件">邮件 (Email)</option>
                      <option value="其他">其他 (Other)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">沟通内容/纪要</label>
                    <textarea
                      rows={3}
                      required
                      value={journeyForm.notes}
                      onChange={(e) => setJourneyForm({ ...journeyForm, notes: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="记录本次沟通的主要内容..."
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">下一步计划 (Next Step)</label>
                    <input
                      type="text"
                      value={journeyForm.next_step}
                      onChange={(e) => setJourneyForm({ ...journeyForm, next_step: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="例如：下周二发送报价单"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingJourney}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {submittingJourney ? '保存中...' : '保存记录'}
                  </button>
                </div>
              </form>
            )}

            {/* Timeline */}
            <div className="flow-root">
              {journeys.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">暂无拜访记录，点击上方按钮添加。</p>
              ) : (
                <ul className="-mb-8">
                  {journeys.map((journey, journeyIdx) => (
                    <li key={journey.id}>
                      <div className="relative pb-8">
                        {journeyIdx !== journeys.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center ring-8 ring-white">
                              {journey.type === '拜访' || journey.type === '会议' ? (
                                <Briefcase className="h-4 w-4 text-blue-600" />
                              ) : journey.type === '电话' ? (
                                <Phone className="h-4 w-4 text-blue-600" />
                              ) : journey.type === '邮件' ? (
                                <Mail className="h-4 w-4 text-blue-600" />
                              ) : (
                                <MessageSquare className="h-4 w-4 text-blue-600" />
                              )}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-900 font-medium">
                                {journey.type}
                              </p>
                              <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-md border border-gray-100">
                                {journey.notes}
                              </div>
                              {journey.next_step && (
                                <p className="mt-2 text-sm text-blue-700 font-medium flex items-center">
                                  <span className="mr-2">下一步:</span> {journey.next_step}
                                </p>
                              )}
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              <time dateTime={journey.date}>{format(new Date(journey.date), 'yyyy-MM-dd HH:mm')}</time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
