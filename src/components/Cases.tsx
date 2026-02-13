import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { caseService } from "../services/case.service";
import { ApiError, Case, PublicCaseDetails } from "../types";

export const Cases = () => {
  const [cases, setCases] = useState<PublicCaseDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [requestLoading, setRequestLoading] = useState<Record<string, boolean>>(
    {},
  );
  const [requests, setRequests] = useState<Case[]>();
  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setIsLoading(true);
      const response = await caseService.getPublicCaseDetails();
      await getMyRequests();
      setCases(response || []);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };
  const getMyRequests = async () => {
    try {
      setIsLoading(true);
      const response = await caseService.getMyRequests();
      setRequests(response || []);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const requestAccess = async (caseId: string) => {
    if (requestLoading[caseId]) return;

    setRequestLoading((s) => ({ ...s, [caseId]: true }));

    try {
      await caseService.requestCaseAccess(caseId);
      // Optional: show success toast
      console.log("Access request sent for", caseId);
      loadCases();
    } catch (err) {
      const error = err as ApiError;
      setError(error.message);
    } finally {
      setRequestLoading((s) => ({ ...s, [caseId]: false }));
    }
  };

  const filtered = cases.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  console.log(requests);

  const getRequestStatus = (caseId: string) => {
    return requests?.find((req) => req.caseId === caseId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          All Cases
        </h1>
      </div>

      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Search cases..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Loading cases...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No cases found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {c.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ID: {c.id}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Type: {c.caseType}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {new Date(c.timestamp).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center justify-end mt-4">
                {(() => {
                  const requestStatus = getRequestStatus(c.id);
                  const isPending = requestStatus?.status === "PENDING";
                  const isApproved = requestStatus?.status === "APPROVED";
                  const isLoading = requestLoading[c.id];

                  return (
                    <button
                      onClick={() => requestAccess(c.id)}
                      disabled={isLoading || isPending || isApproved}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        isLoading || isPending || isApproved
                          ? "bg-blue-200 text-blue-600 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <svg
                            className="animate-spin h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8z"
                            />
                          </svg>
                          Requesting...
                        </span>
                      ) : isPending ? (
                        "Pending"
                      ) : isApproved ? (
                        "Approved"
                      ) : (
                        "Request"
                      )}
                    </button>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
