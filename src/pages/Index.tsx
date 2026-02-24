import { useState } from "react";
import SponsorshipHeader from "@/components/SponsorshipHeader";
import RequestNavigator from "@/components/RequestNavigator";
import SponsorshipDetail from "@/components/SponsorshipDetail";
import { useSponsorshipRequests } from "@/hooks/useSponsorshipRequests";

const Index = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { requests, loading, updateField, deleteRequest, importRequests } = useSponsorshipRequests();

  const handleDelete = async () => {
    if (!requests[currentIndex]) return;
    const success = await deleteRequest(requests[currentIndex].id);
    if (success && currentIndex >= requests.length - 1 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    if (!requests[currentIndex]) return;
    updateField(requests[currentIndex].id, field, value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando pedidos...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SponsorshipHeader onImport={importRequests} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Nenhum pedido de patrocínio. Importe uma planilha para começar.</p>
        </div>
      </div>
    );
  }

  const safeIndex = Math.min(currentIndex, requests.length - 1);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SponsorshipHeader onImport={importRequests} />
      <RequestNavigator
        requests={requests}
        currentIndex={safeIndex}
        onNavigate={setCurrentIndex}
        onDelete={handleDelete}
      />
      <div className="flex-1 overflow-auto">
        <SponsorshipDetail
          request={requests[safeIndex]}
          onFieldChange={handleFieldChange}
        />
      </div>
    </div>
  );
};

export default Index;
