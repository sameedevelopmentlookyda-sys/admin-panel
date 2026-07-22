"use client";

import React, { useState, forwardRef } from "react";
import { CreateSchoolInput, School } from "@/lib/types";
import { Send } from "lucide-react";
import { adminApi } from "@/lib/apiClient";

interface AddSchoolFormProps {
  onSchoolCreated: (newSchool: School) => void;
}

const AddSchoolForm = forwardRef<HTMLDivElement, AddSchoolFormProps>(
  ({ onSchoolCreated }, ref) => {
    const [formData, setFormData] = useState<CreateSchoolInput>({
      schoolName: "",
      headCoachFirstName: "",
      headCoachLastName: "",
      headCoachEmail: "",
      strengthCoachEmail: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!formData.schoolName.trim()) {
        setError("Please enter a school name.");
        return;
      }

      if (!formData.headCoachEmail.trim()) {
        setError("Head Coach Email is required.");
        return;
      }

      setLoading(true);

      try {
        // Calculate 1-year subscription dates
        const today = new Date();
        const nextYear = new Date(today);
        nextYear.setFullYear(today.getFullYear() + 1);

        const subStartStr = today.toISOString().split("T")[0];
        const renewalStr = nextYear.toISOString().split("T")[0];

        // Try calling live backend API
        let teamId = `sch_${Date.now()}`;
        let teamCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        try {
          const result = await adminApi.createTeam({
            name: formData.schoolName.trim(),
            renewalDate: nextYear.toISOString(),
            headCoachEmail: formData.headCoachEmail.trim(),
            headCoachFirstName: formData.headCoachFirstName.trim() || undefined,
            headCoachLastName: formData.headCoachLastName.trim() || undefined,
            strengthCoachEmail: formData.strengthCoachEmail?.trim() || undefined,
          });
          if (result?.teamId) {
            teamId = result.teamId;
            teamCode = result.teamCode || teamCode;
          }
        } catch (err) {
          console.warn(
            "Backend API call fallback to client state update:",
            err,
          );
        }

        // Format coach names
        const hcName =
          [
            formData.headCoachFirstName.trim(),
            formData.headCoachLastName.trim(),
          ]
            .filter(Boolean)
            .join(" ") || "Head Coach";

        const scEmail = formData.strengthCoachEmail?.trim();

        const newSchool: School = {
          id: teamId,
          name: formData.schoolName.trim(),
          teamCode,
          status: "Active",
          subscriptionStart: subStartStr,
          renewalDate: renewalStr,
          headCoach: {
            name: hcName,
            email: formData.headCoachEmail.trim(),
            type: "HC",
            status: "Pending Invite",
          },
          strengthCoach: scEmail
            ? {
                name: "Strength Coach",
                email: scEmail,
                type: "SC",
                status: "Pending Invite",
              }
            : undefined,
          coachesDisplay: scEmail
            ? `${hcName} (HC), Strength Coach (SC)`
            : `${hcName} (HC)`,
        };

        onSchoolCreated(newSchool);

        // Reset Form
        setFormData({
          schoolName: "",
          headCoachFirstName: "",
          headCoachLastName: "",
          headCoachEmail: "",
          strengthCoachEmail: "",
        });
      } catch (err: any) {
        console.error("Failed to create school:", err);
        setError(err.message || "Failed to create school. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div
        ref={ref}
        className="bg-[#1C2128] border border-[#2D333B] rounded-xl p-6 shadow-xl mb-8"
      >
        <div className="flex items-center space-x-2 mb-6">
          <h2 className="text-lg font-bold text-white tracking-wide">
            Add New School
          </h2>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-4 py-2.5 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: School Name */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              SCHOOL NAME
            </label>
            <input
              type="text"
              name="schoolName"
              value={formData.schoolName}
              onChange={handleChange}
              placeholder="Enter school name"
              required
              className="w-full bg-[#171B20] border border-[#2D333B] rounded-lg px-4 py-2.5 text-sm text-white font-medium placeholder-slate-500 focus:outline-none focus:border-[#FAE035] transition"
            />
          </div>

          {/* Row 2: Head Coach First Name & Head Coach Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                HEAD COACH FIRST NAME
              </label>
              <input
                type="text"
                name="headCoachFirstName"
                value={formData.headCoachFirstName}
                onChange={handleChange}
                placeholder="Enter first name"
                className="w-full bg-[#171B20] border border-[#2D333B] rounded-lg px-4 py-2.5 text-sm text-white font-medium placeholder-slate-500 focus:outline-none focus:border-[#FAE035] transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                HEAD COACH LAST NAME
              </label>
              <input
                type="text"
                name="headCoachLastName"
                value={formData.headCoachLastName}
                onChange={handleChange}
                placeholder="Enter last name"
                className="w-full bg-[#171B20] border border-[#2D333B] rounded-lg px-4 py-2.5 text-sm text-white font-medium placeholder-slate-500 focus:outline-none focus:border-[#FAE035] transition"
              />
            </div>
          </div>

          {/* Row 3: Head Coach Email & Strength Coach Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                HEAD COACH EMAIL
              </label>
              <input
                type="email"
                name="headCoachEmail"
                value={formData.headCoachEmail}
                onChange={handleChange}
                placeholder="Enter email address"
                required
                className="w-full bg-[#171B20] border border-[#2D333B] rounded-lg px-4 py-2.5 text-sm text-white font-medium placeholder-slate-500 focus:outline-none focus:border-[#FAE035] transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                STRENGTH COACH EMAIL (OPTIONAL)
              </label>
              <input
                type="email"
                name="strengthCoachEmail"
                value={formData.strengthCoachEmail}
                onChange={handleChange}
                placeholder="Enter email address (optional)"
                className="w-full bg-[#171B20] border border-[#2D333B] rounded-lg px-4 py-2.5 text-sm text-white font-medium placeholder-slate-500 focus:outline-none focus:border-[#FAE035] transition"
              />
            </div>
          </div>

          {/* Submit Button (Aligned Right, Yellow Accent #FAE035) */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-[#FAE035] hover:bg-[#E5CD25] text-black text-xs px-6 py-3 rounded-lg shadow-md font-bold hover:shadow-lg transition duration-200 cursor-pointer disabled:opacity-50"
            >
              <Send size={14} className="rotate-15" />
              <span>
                {loading
                  ? "Creating School..."
                  : "Create School & Send Invites"}
              </span>
            </button>
          </div>
        </form>
      </div>
    );
  },
);

AddSchoolForm.displayName = "AddSchoolForm";

export default AddSchoolForm;
