import { useState, useEffect, useCallback } from "react";
import api from "../lib/api";

export function useDepartments() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/departments");
      setDepartments(data.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load departments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  return { departments, loading, error, refetch: fetchDepartments };
}

export function useEmployees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/employees");
      setEmployees(data.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return { employees, loading, error, refetch: fetchEmployees };
}

export function useCategories() {
  const [categories, setCategories] = useState<{ csr: any[]; challenge: any[] }>({ csr: [], challenge: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const [csrRes, challengeRes] = await Promise.all([
        api.get("/categories?type=CSR_ACTIVITY"),
        api.get("/categories?type=CHALLENGE")
      ]);
      setCategories({
        csr: csrRes.data.data || [],
        challenge: challengeRes.data.data || []
      });
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
}

export function useEsgConfig() {
  const [esgConfig, setEsgConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/settings/esg-configuration");
      setEsgConfig(data.data || null);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load ESG Config");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return { esgConfig, loading, error, refetch: fetchConfig };
}
