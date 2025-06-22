const CompensationStep = ({ formData, updateFormData, errors }) => {
  const handleCTCChange = (field, value) => {
    if (field === "total") {
      updateFormData({
        ctc: {
          ...formData.ctc,
          total: parseFloat(value) || "",
        },
      });
    } else {
      updateFormData({
        ctc: {
          ...formData.ctc,
          breakdown: {
            ...formData.ctc.breakdown,
            [field]: parseFloat(value) || "",
          },
        },
      });
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateBreakdownTotal = () => {
    const { baseSalary, bonus, benefits, other } = formData.ctc.breakdown;
    return (baseSalary || 0) + (bonus || 0) + (benefits || 0) + (other || 0);
  };

  const breakdownTotal = calculateBreakdownTotal();
  const isBreakdownValid =
    !formData.ctc.total || Math.abs(breakdownTotal - formData.ctc.total) < 1000;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-nit-navy mb-4">
          Compensation Details
        </h3>
        <p className="text-gray-600 mb-6">
          Provide the compensation package details for this position
        </p>
      </div>

      {/* Total CTC */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Total CTC (Annual) *
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2 text-gray-500">₹</span>
          <input
            type="number"
            value={formData.ctc.total}
            onChange={(e) => handleCTCChange("total", e.target.value)}
            className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent ${
              errors.ctcTotal ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="e.g., 1200000"
          />
        </div>
        {formData.ctc.total && (
          <p className="text-sm text-gray-600 mt-1">
            {formatCurrency(formData.ctc.total)} per annum
          </p>
        )}
        {errors.ctcTotal && (
          <p className="text-red-500 text-sm mt-1">{errors.ctcTotal}</p>
        )}
      </div>

      {/* CTC Breakdown */}
      <div>
        <h4 className="text-md font-semibold text-gray-800 mb-4">
          CTC Breakdown (Optional)
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          Break down the total compensation into components
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Base Salary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base Salary
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">₹</span>
              <input
                type="number"
                value={formData.ctc.breakdown.baseSalary}
                onChange={(e) => handleCTCChange("baseSalary", e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent"
                placeholder="e.g., 800000"
              />
            </div>
            {formData.ctc.breakdown.baseSalary && (
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrency(formData.ctc.breakdown.baseSalary)}
              </p>
            )}
          </div>

          {/* Bonus */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bonus/Incentives
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">₹</span>
              <input
                type="number"
                value={formData.ctc.breakdown.bonus}
                onChange={(e) => handleCTCChange("bonus", e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent"
                placeholder="e.g., 200000"
              />
            </div>
            {formData.ctc.breakdown.bonus && (
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrency(formData.ctc.breakdown.bonus)}
              </p>
            )}
          </div>

          {/* Benefits */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Benefits & Perks
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">₹</span>
              <input
                type="number"
                value={formData.ctc.breakdown.benefits}
                onChange={(e) => handleCTCChange("benefits", e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent"
                placeholder="e.g., 150000"
              />
            </div>
            {formData.ctc.breakdown.benefits && (
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrency(formData.ctc.breakdown.benefits)}
              </p>
            )}
          </div>

          {/* Other */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Other Components
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">₹</span>
              <input
                type="number"
                value={formData.ctc.breakdown.other}
                onChange={(e) => handleCTCChange("other", e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent"
                placeholder="e.g., 50000"
              />
            </div>
            {formData.ctc.breakdown.other && (
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrency(formData.ctc.breakdown.other)}
              </p>
            )}
          </div>
        </div>

        {/* Breakdown Summary */}
        {breakdownTotal > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">
                Breakdown Total:
              </span>
              <span className="font-semibold text-lg">
                {formatCurrency(breakdownTotal)}
              </span>
            </div>

            {formData.ctc.total && (
              <div className="mt-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Declared Total CTC:</span>
                  <span>{formatCurrency(formData.ctc.total)}</span>
                </div>

                {!isBreakdownValid && (
                  <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800">
                    ⚠️ Breakdown total doesn't match declared CTC
                  </div>
                )}

                {isBreakdownValid && breakdownTotal > 0 && (
                  <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded text-sm text-green-800">
                    ✓ Breakdown matches declared CTC
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Additional Benefits */}
      <div>
        <h4 className="text-md font-semibold text-gray-800 mb-3">
          Additional Information
        </h4>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 mb-2">💡 Pro Tips:</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Be transparent about the compensation structure</li>
            <li>• Include any performance bonuses or stock options</li>
            <li>• Mention benefits like health insurance, PF, etc.</li>
            <li>• Consider mentioning growth opportunities</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CompensationStep;
