const loadFooter = () => {
  return `
    <footer class="bg-lib-blue text-white mt-16 py-10">
      <div class="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 class="font-bold text-xl mb-4 flex items-center">
            <img src="../assets/logo.ico" alt="Logo" class="h-6 mr-2"> Mundo Librería
          </h3>
        </div>
        <div>
          <h3 class="font-bold text-lg mb-4">Horario</h3>
          <p>Lunes a Viernes: 9:00 - 20:00</p>
          <p>Sábados: 10:00 - 18:00</p>
        </div>
        <div>
          <h3 class="font-bold text-lg mb-4">Síguenos</h3>
          <div class="flex space-x-4">
            <a href="#" class="bg-white text-lib-blue p-2 rounded-full hover:bg-lib-yellow">📘</a>
            <a href="#" class="bg-white text-lib-blue p-2 rounded-full hover:bg-lib-yellow">📸</a>
            <a href="#" class="bg-white text-lib-blue p-2 rounded-full hover:bg-lib-yellow">🐦</a>
          </div>
        </div>
      </div>
      <div class="border-t border-blue-300 mt-8 pt-6 text-center text-sm">
        <p>© 2023 Mundo Librería. Todos los derechos reservados.</p>
      </div>
    </footer>
  `;
};