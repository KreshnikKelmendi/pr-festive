
import ContactForm from "./components/ApplyForm/Form";
import { Formpage } from "./components/ApplyForm/Formpage";
import { Header } from "./components/Header";

export default function Home() {
  return (
    <>
      {/* <Header /> */}
      <div className="px-[12px] bg-[#031603]">
        <Formpage />
        <ContactForm />
      </div>
    </>
  );
}
