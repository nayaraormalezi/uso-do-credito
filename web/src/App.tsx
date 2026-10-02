import { JourneyProvider, useJourney } from "./context/JourneyContext";
import { Shell } from "./components/Shell";
import { HubView } from "./views/HubView";
import { PreparationView } from "./views/PreparationView";
import { QuotasView } from "./views/QuotasView";
import { ManagerConfirmView } from "./views/ManagerConfirmView";
import { ManagerSuccessView } from "./views/ManagerSuccessView";
import { PersonalDataView } from "./views/PersonalDataView";
import { DocumentsView } from "./views/DocumentsView";
import { PropertyView } from "./views/PropertyView";
import { InspectionView } from "./views/InspectionView";
import { SellerView } from "./views/SellerView";
import { CostsView } from "./views/CostsView";
import { SummaryView } from "./views/SummaryView";
import { CreditUseDetailView } from "./views/CreditUseDetailView";
import { RequestsView } from "./views/RequestsView";
import { HelpView } from "./views/HelpView";
import { ProfileView } from "./views/ProfileView";

function JourneyRouter() {
  const { state } = useJourney();

  switch (state.view) {
    case "hub":
      return <HubView />;
    case "quotas":
      return <QuotasView />;
    case "managerConfirm":
      return <ManagerConfirmView />;
    case "managerSuccess":
      return <ManagerSuccessView />;
    case "preparation":
      return <PreparationView />;
    case "personalData":
      return <PersonalDataView />;
    case "documents":
      return <DocumentsView />;
    case "property":
      return <PropertyView />;
    case "inspection":
      return <InspectionView />;
    case "seller":
      return <SellerView />;
    case "costs":
      return <CostsView />;
    case "summary":
      return <SummaryView />;
    case "requests":
      return <RequestsView />;
    case "help":
      return <HelpView />;
    case "profile":
      return <ProfileView />;
    case "tracking":
    case "creditUseDetail":
      return <CreditUseDetailView />;
    default:
      return <HubView />;
  }
}

export default function App() {
  return (
    <JourneyProvider>
      <Shell>
        <JourneyRouter />
      </Shell>
    </JourneyProvider>
  );
}
