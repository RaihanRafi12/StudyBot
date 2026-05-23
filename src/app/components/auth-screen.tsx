import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { motion } from 'motion/react';
import { GraduationCap, Gift } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (email: string, password: string) => void;
  onSignup: (data: {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'faculty' | 'researcher' | 'visitor' | 'admin';
    institution?: string;
    major?: string;
    year?: string;
  }) => void;
}

export function AuthScreen({ onLogin, onSignup }: AuthScreenProps) {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<'student' | 'faculty' | 'researcher' | 'visitor' | 'admin'>('student');
  const [signupInstitution, setSignupInstitution] = useState('');
  const [signupMajor, setSignupMajor] = useState('');
  const [signupYear, setSignupYear] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(loginEmail, loginPassword);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    onSignup({
      name: signupName,
      email: signupEmail,
      password: signupPassword,
      role: signupRole,
      institution: signupInstitution,
      major: signupMajor,
      year: signupYear,
    });
  };

  const showAcademicFields = signupRole === 'student' || signupRole === 'faculty';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <motion.div
          className="flex items-center justify-center gap-3 mb-8"
          animate={{
            filter: ['drop-shadow(0 0 0px rgba(99, 102, 241, 0))', 'drop-shadow(0 0 12px rgba(99, 102, 241, 0.5))', 'drop-shadow(0 0 0px rgba(99, 102, 241, 0))'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">StudyBot</h1>
            <p className="text-sm text-muted-foreground">Academic Resource Platform</p>
          </div>
        </motion.div>

        <Card className="backdrop-blur-sm bg-background/95">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Login or create an account to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your.email@university.edu"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    Login
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      placeholder="Alex Johnson"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your.email@university.edu"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-role">Role</Label>
                    <Select value={signupRole} onValueChange={(value: any) => setSignupRole(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="faculty">Faculty</SelectItem>
                        <SelectItem value="researcher">Researcher</SelectItem>
                        <SelectItem value="visitor">Visitor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {showAcademicFields && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="signup-institution">Institution</Label>
                        <Input
                          id="signup-institution"
                          placeholder="University of Technology"
                          value={signupInstitution}
                          onChange={(e) => setSignupInstitution(e.target.value)}
                        />
                      </div>
                      
                      {signupRole === 'student' && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="signup-major">Major</Label>
                            <Input
                              id="signup-major"
                              placeholder="Computer Science"
                              value={signupMajor}
                              onChange={(e) => setSignupMajor(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="signup-year">Academic Year</Label>
                            <Select value={signupYear} onValueChange={setSignupYear}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select year" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1st Year">1st Year</SelectItem>
                                <SelectItem value="2nd Year">2nd Year</SelectItem>
                                <SelectItem value="3rd Year">3rd Year</SelectItem>
                                <SelectItem value="4th Year">4th Year</SelectItem>
                                <SelectItem value="Graduate">Graduate</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                      
                      {signupRole === 'faculty' && (
                        <div className="space-y-2">
                          <Label htmlFor="signup-department">Department</Label>
                          <Input
                            id="signup-department"
                            placeholder="Computer Science"
                            value={signupMajor}
                            onChange={(e) => setSignupMajor(e.target.value)}
                          />
                        </div>
                      )}
                    </motion.div>
                  )}

                  <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                    <Gift className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Get 20 bonus points on signup!
                    </p>
                  </div>
                  
                  <Button type="submit" className="w-full" size="lg">
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}