// export default function Footer() {
//     return (
//         <footer className="bg-gradient-to-b from-[#005496] to-[#003d73] text-white p-2 text-right bottom-0 w-full font-inter font-medium fixed">
//             <p>&copy; {new Date().getFullYear()} - Autoliv (Thailand) Co., Ltd. All rights reserved.</p>
//         </footer>
//     );
// }

export default function Footer() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION
  return (
    <footer className="w-full fixed bottom-0 px-4 py-2 text-xs text-left text-gray/20 bg-transparent font-inter">
      <p>
        &copy; {new Date().getFullYear()} - Autoliv (Thailand) Co., Ltd. All rights reserved.
        {version && <span className="ml-2 text-gray-400">(V.{version})</span>}
      </p>
    </footer>
  );
}

