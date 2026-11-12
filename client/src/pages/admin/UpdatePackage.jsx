import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import PackageForm from "./PackageForm";
import { ErrorState } from "../components/StateViews";
import Spinner from "../components/Spinner";

const UpdatePackage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: pkg, loading, error } = useApi(`/api/package/get-package-data/${id}?admin=1`, { select: (d) => d.packageData });

  if (loading) return <Spinner />;
  if (error || !pkg) return <ErrorState message={error || "Package not found"} />;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <PackageForm initial={pkg} onSaved={(saved) => navigate(`/package/${saved?.slug || pkg.slug}`)} />
    </div>
  );
};

export default UpdatePackage;
