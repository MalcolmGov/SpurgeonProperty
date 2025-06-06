import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator, PieChart, TrendingUp, Home, DollarSign, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MortgageCalculatorProps {
  propertyPrice?: number;
}

interface MortgageCalculation {
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
}

interface AffordabilityResult {
  maxAffordablePrice: number;
  recommendedDownPayment: number;
  monthlyIncome: number;
  debtToIncomeRatio: number;
  affordabilityRating: 'excellent' | 'good' | 'fair' | 'poor';
}

export default function MortgageCalculator({ propertyPrice }: MortgageCalculatorProps) {
  const [homePrice, setHomePrice] = useState(propertyPrice || 1500000);
  const [downPayment, setDownPayment] = useState(300000);
  const [interestRate, setInterestRate] = useState(11.75);
  const [loanTerm, setLoanTerm] = useState(20);
  const [monthlyIncome, setMonthlyIncome] = useState(50000);
  const [monthlyDebts, setMonthlyDebts] = useState(5000);
  const [propertyType, setPropertyType] = useState("house");
  const [calculation, setCalculation] = useState<MortgageCalculation | null>(null);
  const [affordability, setAffordability] = useState<AffordabilityResult | null>(null);

  const calculateMortgage = () => {
    const loanAmount = homePrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;

    if (loanAmount <= 0 || monthlyRate <= 0 || numberOfPayments <= 0) {
      setCalculation(null);
      return;
    }

    const monthlyPayment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const totalPayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayment - loanAmount;

    setCalculation({
      loanAmount,
      interestRate,
      loanTerm,
      monthlyPayment,
      totalInterest,
      totalPayment,
    });
  };

  const calculateAffordability = () => {
    // South African lending criteria - typically 30% of gross income for housing
    const maxHousingExpense = monthlyIncome * 0.30;
    const netIncomeAfterDebts = monthlyIncome - monthlyDebts;
    const debtToIncomeRatio = (monthlyDebts / monthlyIncome) * 100;
    
    // Calculate maximum loan amount based on income
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    
    const maxLoanAmount = maxHousingExpense * 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1) /
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments));
    
    // Assuming 20% down payment for affordability calculation
    const recommendedDownPayment = maxLoanAmount * 0.25;
    const maxAffordablePrice = maxLoanAmount + recommendedDownPayment;
    
    // Determine affordability rating
    let affordabilityRating: 'excellent' | 'good' | 'fair' | 'poor';
    if (debtToIncomeRatio < 20 && homePrice <= maxAffordablePrice * 0.8) {
      affordabilityRating = 'excellent';
    } else if (debtToIncomeRatio < 30 && homePrice <= maxAffordablePrice) {
      affordabilityRating = 'good';
    } else if (debtToIncomeRatio < 40 && homePrice <= maxAffordablePrice * 1.2) {
      affordabilityRating = 'fair';
    } else {
      affordabilityRating = 'poor';
    }
    
    setAffordability({
      maxAffordablePrice,
      recommendedDownPayment,
      monthlyIncome,
      debtToIncomeRatio,
      affordabilityRating
    });
  };

  useEffect(() => {
    calculateMortgage();
    calculateAffordability();
  }, [homePrice, downPayment, interestRate, loanTerm, monthlyIncome, monthlyDebts]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getAffordabilityColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'fair': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'poor': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTransferDuty = (price: number) => {
    // South African transfer duty rates 2024
    if (price <= 1000000) return 0;
    if (price <= 1375000) return (price - 1000000) * 0.03;
    if (price <= 1925000) return 11250 + (price - 1375000) * 0.06;
    if (price <= 2475000) return 44250 + (price - 1925000) * 0.08;
    if (price <= 11000000) return 88250 + (price - 2475000) * 0.11;
    return 1026000 + (price - 11000000) * 0.13;
  };

  const downPaymentPercentage = ((downPayment / homePrice) * 100).toFixed(1);
  const transferDuty = getTransferDuty(homePrice);
  const bondCosts = homePrice * 0.015; // Estimated bond registration costs
  const totalUpfrontCosts = downPayment + transferDuty + bondCosts + 15000; // Including attorney fees

  return (
    <TooltipProvider>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            <span>Advanced Mortgage Calculator</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Comprehensive South African mortgage and affordability analysis
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="calculator" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="calculator" className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Calculator
              </TabsTrigger>
              <TabsTrigger value="affordability" className="flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                Affordability
              </TabsTrigger>
              <TabsTrigger value="costs" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Costs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calculator" className="space-y-6">
              {/* Property Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Property Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="homePrice">Property Price</Label>
                    <Input
                      id="homePrice"
                      type="number"
                      value={homePrice}
                      onChange={(e) => setHomePrice(Number(e.target.value))}
                      placeholder="1,500,000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="propertyType">Property Type</Label>
                    <Select value={propertyType} onValueChange={setPropertyType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="townhouse">Townhouse</SelectItem>
                        <SelectItem value="vacant_land">Vacant Land</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Loan Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Loan Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="downPayment" className="flex items-center gap-2">
                      Down Payment ({downPaymentPercentage}%)
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Minimum 10% required. Higher down payment reduces monthly costs.</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      id="downPayment"
                      type="number"
                      value={downPayment}
                      onChange={(e) => setDownPayment(Number(e.target.value))}
                      placeholder="300,000"
                    />
                    <div className="mt-2">
                      <Slider
                        value={[downPayment]}
                        onValueChange={([value]) => setDownPayment(value)}
                        max={homePrice * 0.5}
                        min={homePrice * 0.1}
                        step={10000}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interestRate" className="flex items-center gap-2">
                      Interest Rate (%)
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Current SA prime rate is 11.75%. Your rate may vary based on credit score.</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.25"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      placeholder="11.75"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loanTerm">Loan Term (years)</Label>
                    <Select value={loanTerm.toString()} onValueChange={(value) => setLoanTerm(Number(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 years</SelectItem>
                        <SelectItem value="15">15 years</SelectItem>
                        <SelectItem value="20">20 years</SelectItem>
                        <SelectItem value="25">25 years</SelectItem>
                        <SelectItem value="30">30 years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Results */}
              {calculation && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Monthly Payment Breakdown
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                      <div className="text-center">
                        <p className="text-sm font-medium text-blue-700 mb-1">Monthly Payment</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {formatCurrency(calculation.monthlyPayment)}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">Principal & Interest</p>
                      </div>
                    </Card>

                    <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                      <div className="text-center">
                        <p className="text-sm font-medium text-green-700 mb-1">Loan Amount</p>
                        <p className="text-xl font-bold text-green-900">
                          {formatCurrency(calculation.loanAmount)}
                        </p>
                        <p className="text-xs text-green-600 mt-1">After down payment</p>
                      </div>
                    </Card>

                    <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                      <div className="text-center">
                        <p className="text-sm font-medium text-orange-700 mb-1">Total Interest</p>
                        <p className="text-xl font-bold text-orange-900">
                          {formatCurrency(calculation.totalInterest)}
                        </p>
                        <p className="text-xs text-orange-600 mt-1">Over loan term</p>
                      </div>
                    </Card>

                    <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                      <div className="text-center">
                        <p className="text-sm font-medium text-purple-700 mb-1">Total Payment</p>
                        <p className="text-xl font-bold text-purple-900">
                          {formatCurrency(calculation.totalPayment)}
                        </p>
                        <p className="text-xs text-purple-600 mt-1">Principal + Interest</p>
                      </div>
                    </Card>
                  </div>

                  {/* Additional Monthly Costs */}
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3">Estimated Monthly Housing Costs</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Principal & Interest</span>
                        <span className="font-medium">{formatCurrency(calculation.monthlyPayment)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Property Insurance (est.)</span>
                        <span className="font-medium">{formatCurrency((homePrice * 0.004) / 12)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Municipal Rates (est.)</span>
                        <span className="font-medium">{formatCurrency((homePrice * 0.008) / 12)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Homeowners Insurance</span>
                        <span className="font-medium">{formatCurrency(800)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center font-semibold text-lg">
                        <span>Total Monthly Housing Cost</span>
                        <span className="text-blue-600">
                          {formatCurrency(
                            calculation.monthlyPayment +
                            (homePrice * 0.004) / 12 +
                            (homePrice * 0.008) / 12 +
                            800
                          )}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="affordability" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Affordability Analysis
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyIncome">Monthly Gross Income</Label>
                    <Input
                      id="monthlyIncome"
                      type="number"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                      placeholder="50,000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthlyDebts">Monthly Debt Payments</Label>
                    <Input
                      id="monthlyDebts"
                      type="number"
                      value={monthlyDebts}
                      onChange={(e) => setMonthlyDebts(Number(e.target.value))}
                      placeholder="5,000"
                    />
                  </div>
                </div>

                {affordability && (
                  <div className="space-y-4">
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">Affordability Rating</h4>
                        <Badge className={getAffordabilityColor(affordability.affordabilityRating)}>
                          {affordability.affordabilityRating.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Max Affordable Price</p>
                          <p className="text-xl font-bold text-green-600">
                            {formatCurrency(affordability.maxAffordablePrice)}
                          </p>
                        </div>
                        
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Debt-to-Income Ratio</p>
                          <p className="text-xl font-bold">
                            {affordability.debtToIncomeRatio.toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <h5 className="font-medium text-blue-900 mb-2">Recommendations</h5>
                        <div className="text-sm text-blue-800 space-y-1">
                          {affordability.affordabilityRating === 'excellent' && (
                            <p>Excellent! You're well within safe borrowing limits.</p>
                          )}
                          {affordability.affordabilityRating === 'good' && (
                            <p>Good affordability. Consider increasing your down payment for better rates.</p>
                          )}
                          {affordability.affordabilityRating === 'fair' && (
                            <p>Fair affordability. Consider reducing debts or increasing income before purchasing.</p>
                          )}
                          {affordability.affordabilityRating === 'poor' && (
                            <p>This property may be above your budget. Consider a lower-priced property or improve your financial position.</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="costs" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Total Purchase Costs
                </h3>

                <Card className="p-4">
                  <h4 className="font-semibold mb-4">Upfront Costs Breakdown</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Property Price</span>
                      <span className="font-medium">{formatCurrency(homePrice)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Down Payment ({downPaymentPercentage}%)</span>
                      <span className="font-medium">{formatCurrency(downPayment)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Transfer Duty</span>
                      <span className="font-medium">{formatCurrency(transferDuty)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Bond Registration Costs</span>
                      <span className="font-medium">{formatCurrency(bondCosts)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Attorney Fees</span>
                      <span className="font-medium">{formatCurrency(15000)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Home Inspection</span>
                      <span className="font-medium">{formatCurrency(5000)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center font-semibold text-lg">
                      <span>Total Upfront Costs</span>
                      <span className="text-red-600">{formatCurrency(totalUpfrontCosts + 5000)}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-4">Ongoing Monthly Costs</h4>
                  <div className="space-y-3">
                    {calculation && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Mortgage Payment</span>
                          <span className="font-medium">{formatCurrency(calculation.monthlyPayment)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Property Insurance</span>
                          <span className="font-medium">{formatCurrency((homePrice * 0.004) / 12)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Municipal Rates</span>
                          <span className="font-medium">{formatCurrency((homePrice * 0.008) / 12)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Maintenance (est.)</span>
                          <span className="font-medium">{formatCurrency((homePrice * 0.01) / 12)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center font-semibold text-lg">
                          <span>Total Monthly Cost</span>
                          <span className="text-blue-600">
                            {formatCurrency(
                              calculation.monthlyPayment +
                              (homePrice * 0.004) / 12 +
                              (homePrice * 0.008) / 12 +
                              (homePrice * 0.01) / 12
                            )}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
