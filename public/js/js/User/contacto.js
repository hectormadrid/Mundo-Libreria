document.addEventListener("DOMContentLoaded", () => {
  const contactoLink = document.getElementById("contacto-link");
  const productosContainer = document.getElementById("productos-container");
  const productosHeader = document.getElementById("productos-header"); // Referencia al div completo

  if (contactoLink) {
    contactoLink.addEventListener("click", (e) => {
      e.preventDefault();

      if (productosContainer) productosContainer.classList.add("hidden");
      if (productosHeader) productosHeader.classList.add("hidden"); // Ocultar el div completo con el ID

      let contactoContainer = document.getElementById("contacto-container");
      if (!contactoContainer) {
        contactoContainer = document.createElement("div");
        contactoContainer.id = "contacto-container";
        contactoContainer.className = "mt-12 container mx-auto px-4";
        contactoContainer.innerHTML = `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div class="bg-white p-6 rounded-xl shadow-md border">
              <h2 class="text-3xl font-bold text-lib-blue mb-4">Contáctanos</h2>
              <p class="mb-4 text-gray-700">¿Tienes dudas o consultas? Puedes comunicarte con nosotros a través de los siguientes medios:</p>
              <ul class="space-y-3">
                <li class="flex items-start">
                  <span class="text-lib-red font-bold w-32">Teléfono:</span>
                  <span class="text-gray-800">+569 4187 0729</span>
                </li>
                <li class="flex items-start">
                  <span class="text-lib-red font-bold w-32">Correo:</span>
                  <span class="text-gray-800">MundoLibreria07@gmail.com</span>
                </li>
                <li class="flex items-start">
                  <span class="text-lib-red font-bold w-32">Dirección:</span>
                  <span class="text-gray-800">Estancilla 853, 8340518 Codegua, O\'Higgins, Chile</span>
                </li>
              </ul>
            </div>

           <div class="rounded-xl overflow-hidden shadow-md border h-[400px]">
  <iframe
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3324.073263522781!2d-70.6576055!3d-34.0370029!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x966347baf26041cd%3A0x85a209dac1ce737a!2sMundo%20Librer%C3%ADa!5e0!3m2!1ses-419!2sar!4v1722382929430!5m2!1ses-419!2sar!5m2!1ses-419!2sar"
    width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
</div>

          </div>
        `;
        document.querySelector("main")?.appendChild(contactoContainer);
      }

      contactoContainer.classList.remove("hidden");
    });
  }

  document.querySelectorAll(".category-link").forEach((link) => {
    link.addEventListener("click", () => {
      const contactoContainer = document.getElementById("contacto-container");
      if (contactoContainer) contactoContainer.classList.add("hidden");
      if (productosContainer) productosContainer.classList.remove("hidden");
      if (productosHeader) productosHeader.classList.remove("hidden"); // Mostrar el div completo
    });
  });
});