import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Upload, X, FileText, CheckCircle2, Loader2, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Progress } from './ui/progress';

interface UploadViewProps {
  onUpload: (resource: {
    title: string;
    category: string;
    description: string;
    isPublic: boolean;
    files: File[];
  }) => void;
}

export function UploadView({ onUpload }: UploadViewProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles([...files, ...droppedFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles([...files, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !category || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadComplete(true);
          
          // Call the upload handler
          onUpload({ title, category, description, isPublic, files });
          
          // Reset form after a delay
          setTimeout(() => {
            setTitle('');
            setCategory('');
            setDescription('');
            setIsPublic(true);
            setFiles([]);
            setUploadComplete(false);
            setUploadProgress(0);
          }, 2000);
          
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Upload Resource</h1>
        <p className="text-muted-foreground">
          Share your academic materials with others
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Resource Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Advanced Data Structures Notes"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="courses">Courses</SelectItem>
                      <SelectItem value="documents">Documents</SelectItem>
                      <SelectItem value="projects">Projects</SelectItem>
                      <SelectItem value="research">Research Papers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Provide a detailed description of your resource..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">
                    File Upload <span className="text-red-500">*</span>
                  </Label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer ${
                      isDragging ? 'border-primary bg-primary/5' : ''
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file')?.click()}
                  >
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, DOCX, PPTX up to 10MB
                    </p>
                    <Input
                      id="file"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.ppt,.pptx"
                      multiple
                      onChange={handleFileSelect}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                  <div className="space-y-0.5">
                    <Label htmlFor="public">Make Public</Label>
                    <p className="text-xs text-muted-foreground">
                      Anyone can access without requesting permission
                    </p>
                  </div>
                  <Switch
                    id="public"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                </div>

                <Button type="submit" className="w-full" size="lg">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Resource
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Info Cards */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Coins className="h-5 w-5" />
                Earn Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                Upload a resource and earn <span className="font-bold text-green-600 dark:text-green-400">+2 points</span>
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✓ Help other students learn</p>
                <p>✓ Build your academic reputation</p>
                <p>✓ Get feedback through reviews</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Upload original or properly cited content</p>
              <p>• Provide clear, accurate descriptions</p>
              <p>• Use appropriate categories</p>
              <p>• Respect copyright and licensing</p>
              <p>• Keep files organized and clean</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {file.name} ({formatFileSize(file.size)})
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="text-red-500"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={uploadProgress} className="h-2" />
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm text-muted-foreground">
                  {uploadProgress}%
                </p>
                <p className="text-sm text-muted-foreground">
                  {isUploading ? 'Uploading...' : 'Complete'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upload Complete */}
      {uploadComplete && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Complete</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
                <p className="text-sm text-muted-foreground ml-2">
                  Your resource has been uploaded successfully.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}