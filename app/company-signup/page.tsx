"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Building2, Upload, Check, ArrowRight } from 'lucide-react';
import { signUpCompany } from '@/lib/utils';

export default function CompanySignup() {
    const [uploadedLogo, setUploadedLogo] = useState<File | null>(null);
    const [stage, setStage] = useState(1);
    const [formData, setFormData] = useState({
        companyName: '',
        industry: '',
        website: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false,
        pricingPlan: 'basic'
    });

    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadedLogo(file);
        }
    };

    const handleCheckboxChange = (checked: any) => {
        setFormData(prev => ({ ...prev, agreeTerms: checked }));
    };

    const handleRadioChange = (value: any) => {
        setFormData(prev => ({ ...prev, pricingPlan: value }));
    };

    const validateStage1 = () => {
        if (!formData.companyName || !formData.industry || !formData.website ||
            !formData.email || !formData.password || !formData.confirmPassword) {
            alert('Please fill in all fields');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match');
            return false;
        }

        if (!formData.agreeTerms) {
            alert('Please agree to the terms and conditions');
            return false;
        }

        return true;
    };

    const handleNext = () => {
        if (validateStage1()) {
            setStage(2);
        }
    };

    const handleBack = () => {
        setStage(1);
    };

    const handleSubmit = async () => {
        try {
            const { error } = await signUpCompany({
                companyName: formData.companyName,
                industry: formData.industry,
                website: formData.website,
                email: formData.email,
                password: formData.password,
                pricingPlan: formData.pricingPlan,
            });
            if (error) {
                alert(error.message || 'Signup failed.');
            } else {
                alert('Company registered successfully! Please check your email to verify your account.');
                // Optionally redirect or reset form
            }
        } catch (err) {
            alert('Signup failed.');
        }
    };

    const industries = [
        "Technology", "Healthcare", "Finance", "Education",
        "Manufacturing", "Retail", "Energy", "Media", "Other"
    ];

    const pricingPlans = [
        {
            id: "basic",
            name: "Basic",
            price: "$199",
            period: "per month",
            features: [
                "Up to 50 volunteers",
                "Basic analytics",
                "Email support",
                "1 admin account"
            ]
        },
        {
            id: "pro",
            name: "Professional",
            price: "$499",
            period: "per month",
            features: [
                "Up to 500 volunteers",
                "Advanced analytics",
                "Priority support",
                "5 admin accounts",
                "Custom branding"
            ]
        },
        {
            id: "enterprise",
            name: "Enterprise",
            price: "$999",
            period: "per month",
            features: [
                "Unlimited volunteers",
                "Premium analytics",
                "Dedicated support",
                "Unlimited admin accounts",
                "Custom branding",
                "API access",
                "Custom integration"
            ]
        }
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
            <Card className="w-full max-w-5xl shadow-lg">
                <CardHeader className="space-y-1">
                    <div className="flex items-center mb-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 mr-2"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <CardTitle className="text-2xl font-bold text-emerald-600 flex items-center">
                            <Building2 className="mr-2 h-5 w-5" /> Company Sign Up
                        </CardTitle>
                    </div>
                    <CardDescription>
                        {stage === 1
                            ? "Create your company account to start making an impact"
                            : "Choose a pricing plan that fits your needs"}
                    </CardDescription>

                    <div className="flex items-center mt-2">
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                                1
                            </div>
                            <div className="text-xs font-medium ml-2">Company Info</div>
                        </div>
                        <div className={`h-0.5 w-16 mx-2 ${stage >= 2 ? "bg-emerald-600" : "bg-gray-300"}`}></div>
                        <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full ${stage >= 2 ? "bg-emerald-600" : "bg-gray-300"} flex items-center justify-center text-white`}>
                                2
                            </div>
                            <div className="text-xs font-medium ml-2">Pricing Plan</div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {stage === 1 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="companyName">Company Name</Label>
                                <Input
                                    id="companyName"
                                    name="companyName"
                                    placeholder="Acme Corporation"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="industry">Industry</Label>
                                <Select
                                    onValueChange={(value) => handleSelectChange("industry", value)}
                                    value={formData.industry}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select industry" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {industries.map(industry => (
                                            <SelectItem key={industry} value={industry}>
                                                {industry}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="website">Website</Label>
                                <Input
                                    id="website"
                                    name="website"
                                    placeholder="https://example.com"
                                    value={formData.website}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="contact@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2 col-span-full">
                                <Label htmlFor="logo">Company Logo</Label>
                                {uploadedLogo ? (
                                    <div className="flex items-center justify-between border border-gray-300 rounded-md p-3">
                                        <span className="text-sm truncate max-w-xs">{uploadedLogo.name}</span>
                                        <button
                                            type="button"
                                            className="text-red-500 text-sm ml-4"
                                            onClick={() => setUploadedLogo(null)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ) : (
                                    <label
                                        htmlFor="logo"
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
                                    >
                                        <Upload className="h-10 w-10 text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-600 text-center">
                                            Click to upload or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            SVG, PNG, JPG or GIF (max. 2MB)
                                        </p>
                                        <input
                                            id="logo"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>


                            <div className="flex items-start space-x-2 col-span-full mt-2">
                                <Checkbox
                                    id="terms"
                                    checked={formData.agreeTerms}
                                    onCheckedChange={handleCheckboxChange}
                                />
                                <Label
                                    htmlFor="terms"
                                    className="text-sm text-gray-600 dark:text-gray-400"
                                >
                                    I agree to the{" "}
                                    <a className="text-emerald-600 hover:text-emerald-700 cursor-pointer">
                                        Terms and Conditions
                                    </a>
                                </Label>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h3 className="text-lg font-medium mb-4">Select Your Plan</h3>
                            <RadioGroup
                                value={formData.pricingPlan}
                                onValueChange={handleRadioChange}
                                className="grid grid-cols-1 md:grid-cols-3 gap-4"
                            >
                                {pricingPlans.map(plan => (
                                    <div
                                        key={plan.id}
                                        className={`border rounded-lg p-4 cursor-pointer transition-all ${formData.pricingPlan === plan.id
                                            ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                                            : "border-gray-200 hover:border-emerald-200"
                                            }`}
                                    >
                                        <RadioGroupItem
                                            value={plan.id}
                                            id={plan.id}
                                            className="sr-only"
                                        />
                                        <div className="flex items-center justify-between">
                                            <Label
                                                htmlFor={plan.id}
                                                className="font-medium text-lg cursor-pointer"
                                            >
                                                {plan.name}
                                            </Label>
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.pricingPlan === plan.id
                                                ? "border-emerald-600"
                                                : "border-gray-300"
                                                }`}>
                                                {formData.pricingPlan === plan.id && (
                                                    <div className="w-3 h-3 rounded-full bg-emerald-600" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <span className="text-2xl font-bold">{plan.price}</span>
                                            <span className="text-gray-500 ml-1">{plan.period}</span>
                                        </div>
                                        <ul className="mt-4 space-y-2">
                                            {plan.features.map((feature, index) => (
                                                <li key={index} className="flex items-center text-gray-600 dark:text-gray-400">
                                                    <Check className="h-4 w-4 text-emerald-600 mr-2" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    )}
                </CardContent>

                <CardFooter className={stage === 2 ? "flex justify-between" : ""}>
                    {stage === 1 ? (
                        <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                            onClick={handleNext}
                        >
                            Next
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                onClick={handleBack}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={handleSubmit}
                            >
                                Complete Sign Up
                            </Button>
                        </>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
