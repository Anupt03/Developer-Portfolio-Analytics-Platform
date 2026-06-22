import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import { FileText, UploadCloud, CheckCircle2, AlertCircle, TrendingUp, Briefcase, GraduationCap, X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

import type { RootState } from '../store';
import { fetchResumeAnalysis, uploadResume } from '../store/resumeSlice';
import StatsCard from '../components/StatsCard';
import ScoreGauge from '../components/ScoreGauge';
import LoadingSpinner from '../components/LoadingSpinner';

const ResumeAnalyzer = () => {
  const dispatch = useDispatch();
  const { data, isLoading, error } = useSelector((state: RootState) => state.resume);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    dispatch(fetchResumeAnalysis() as any);
  }, [dispatch]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are supported.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB.');
      return;
    }

    setIsUploading(true);
    try {
      await dispatch(uploadResume(file) as any).unwrap();
      toast.success('Resume analyzed successfully!');
    } catch (err: any) {
      toast.error(err || 'Failed to analyze resume. Please try a different PDF.');
    } finally {
      setIsUploading(false);
    }
  }, [dispatch]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  if (isLoading && !data && !isUploading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!data && !isLoading && !isUploading) {
    return (
      <div className="h-[calc(100vh-12rem)] flex items-center justify-center">
        <div className="glass-card p-10 rounded-3xl max-w-xl w-full text-center border border-white/10">
          <div className="w-20 h-20 bg-blue-500/20 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
            <FileText className="w-10 h-10 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Upload Resume</h2>
          <p className="text-gray-400 mb-8">
            Upload your PDF resume to get ATS scoring, quality metrics, and AI-driven improvement tips.
          </p>
          
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all ${
              isDragActive 
                ? 'border-blue-500 bg-blue-500/10 scale-105' 
                : 'border-white/20 bg-surface/50 hover:border-blue-400 hover:bg-surface'
            }`}
          >
            <input {...getInputProps()} />
            <UploadCloud className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? 'text-blue-400' : 'text-gray-400'}`} />
            <p className="text-white font-medium mb-1">
              {isDragActive ? 'Drop your resume here' : 'Drag & drop your PDF here'}
            </p>
            <p className="text-sm text-gray-500">or click to browse files (Max 5MB)</p>
          </div>
        </div>
      </div>
    );
  }

  if (isUploading) {
    return (
      <div className="h-[calc(100vh-12rem)] flex flex-col items-center justify-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-lg font-medium text-gray-300 animate-pulse">Parsing and analyzing your resume...</p>
        <p className="text-sm text-gray-500">Extracting skills, experience, and calculating ATS score.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header and Re-upload */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Resume Analysis Results</h1>
          <p className="text-gray-400 mt-1">Parsed from: <span className="text-gray-300 font-medium">{data.fileName}</span></p>
        </div>
        
        <div 
          {...getRootProps()} 
          className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-hover border border-white/10 rounded-xl cursor-pointer transition-colors"
        >
          <input {...getInputProps()} />
          <UploadCloud className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">Upload New Resume</span>
        </div>
      </div>

      {/* Main Scores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl flex items-center justify-around">
          <ScoreGauge 
            score={data.atsScore} 
            size={140} 
            label="ATS Compatibility" 
            colorClass={data.atsScore >= 80 ? "text-emerald-400" : data.atsScore >= 60 ? "text-amber-400" : "text-red-400"}
          />
          <div className="w-px h-24 bg-white/10 hidden sm:block"></div>
          <ScoreGauge 
            score={data.resumeQualityScore} 
            size={140} 
            label="Quality Score" 
            colorClass="text-blue-400"
          />
        </div>
        
        <StatsCard 
          title="Skills Extracted" 
          value={data.skills.length} 
          icon={CheckCircle2} 
        />
        <StatsCard 
          title="Missing Keywords" 
          value={data.missingSkills.length} 
          icon={AlertCircle} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Skills & Tips */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Improvement Tips */}
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-semibold text-white">Actionable Tips</h3>
            </div>
            <ul className="space-y-4">
              {data.improvementTips.map((tip: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></div>
                  <span className="text-gray-300 leading-relaxed">{tip}</span>
                </li>
              ))}
              {data.improvementTips.length === 0 && (
                <p className="text-emerald-400 text-sm">Your resume looks great! No major tips to suggest.</p>
              )}
            </ul>
          </div>

          {/* Missing Skills */}
          {data.missingSkills.length > 0 && (
            <div className="glass-card p-6 rounded-2xl border border-white/5 border-l-4 border-l-red-500">
              <div className="flex items-center gap-2 mb-4">
                <X className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-semibold text-white">Missing In-Demand Skills</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">Adding these skills can significantly improve your ATS score for tech roles.</p>
              <div className="flex flex-wrap gap-2">
                {data.missingSkills.map((skill: string) => (
                  <span key={skill} className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Parsed Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Found Skills */}
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <h3 className="text-lg font-semibold text-white mb-4">Detected Technical Skills</h3>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill: string) => (
                <span key={skill} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-200 text-sm font-medium">
                  {skill}
                </span>
              ))}
              {data.skills.length === 0 && <p className="text-gray-500 text-sm">No technical skills detected.</p>}
            </div>
          </div>

          {/* Experience */}
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 mb-6">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-semibold text-white">Parsed Experience</h3>
            </div>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              {data.experience.map((exp: any, idx: number) => (
                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-surface bg-indigo-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-xl border border-white/5 bg-surface/50">
                    <div className="flex flex-col mb-2">
                      <h4 className="font-bold text-white text-lg">{exp.role}</h4>
                      <div className="flex flex-wrap gap-2 text-sm">
                        <span className="text-indigo-400 font-medium">{exp.company}</span>
                        {exp.duration && <span className="text-gray-500">• {exp.duration}</span>}
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-3">{exp.description}</p>
                  </div>
                </div>
              ))}
              {data.experience.length === 0 && <p className="text-gray-500 text-sm pl-8">No experience sections detected.</p>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
