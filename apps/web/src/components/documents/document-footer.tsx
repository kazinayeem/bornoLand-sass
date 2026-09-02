import React from "react";

interface DocumentFooterProps {
  terms?: string;
  notes?: string;
  showSignatures?: boolean;
  signatureLabels?: string[];
  isThermal?: boolean;
}

export function DocumentFooter({
  terms,
  notes,
  showSignatures = true,
  signatureLabels = ["Prepared By", "Checked By", "Authorized Signature"],
  isThermal = false,
}: DocumentFooterProps) {
  if (isThermal) {
    return (
      <div className="text-center pt-2 mt-2 border-t border-dashed border-zinc-400 text-[10px] text-zinc-600">
        {notes && <p className="mb-1 italic">{notes}</p>}
        <p className="font-semibold">Thank you for shopping with us!</p>
        <p className="text-[9px] text-zinc-500 mt-1">Software by BornoLand • www.bornoland.com</p>
      </div>
    );
  }

  return (
    <div className="mt-8 pt-4 border-t border-zinc-200 text-xs text-zinc-600 page-break-avoid">
      {/* Terms & Notes */}
      {(notes || terms) && (
        <div className="grid grid-cols-2 gap-6 mb-6">
          {notes && (
            <div>
              <span className="font-bold text-zinc-700 uppercase tracking-wider text-[10px] block mb-1">
                Notes & Remarks:
              </span>
              <p className="text-zinc-600 leading-relaxed whitespace-pre-wrap">{notes}</p>
            </div>
          )}
          {terms && (
            <div>
              <span className="font-bold text-zinc-700 uppercase tracking-wider text-[10px] block mb-1">
                Terms & Conditions:
              </span>
              <p className="text-zinc-600 leading-relaxed whitespace-pre-wrap">{terms}</p>
            </div>
          )}
        </div>
      )}

      {/* Signature Lines */}
      {showSignatures && (
        <div className="grid grid-cols-3 gap-8 pt-12 pb-4 text-center">
          {signatureLabels.map((label, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="w-full border-t border-zinc-400 pt-1 text-[11px] font-semibold text-zinc-800">
                {label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Bar */}
      <div className="flex items-center justify-between pt-4 mt-2 border-t border-dotted border-zinc-200 text-[10px] text-zinc-400">
        <span>This is a computer-generated document. No digital signature is required.</span>
        <span>Powered by BornoLand SaaS Operating System</span>
      </div>
    </div>
  );
}
