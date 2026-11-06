// Términos y Política de privacidad de Vet Avalon.
// BORRADOR: redactado como base, debe validarlo un abogado antes del primer cobro (plan de lanzamiento, sección 5).
// Al cambiar cualquier texto, sube LEGAL_VERSION aquí y en server.js: el registro guarda la versión aceptada.

export const LEGAL_VERSION = '2026-11-06';

// Datos del responsable del servicio. Reemplazar al constituir la SpA y tener RUT de empresa.
export const LEGAL_ENTITY = {
  name: 'Vet Avalon',
  holder: 'Ariel López (en proceso de constitución como sociedad por acciones)',
  rut: '[RUT por completar al constituir la sociedad]',
  email: 'contacto@vetavalon.cl',
  updated: '6 de noviembre de 2026',
};

export interface LegalSection { title: string; body: string[] }
export interface LegalDoc { title: string; intro: string; sections: LegalSection[] }

export const TERMS: LegalDoc = {
  title: 'Términos y condiciones',
  intro: `Estos términos regulan el uso de Vet Avalon, una ficha clínica web para veterinarios de perros y gatos. Al crear una cuenta los aceptas. Versión ${LEGAL_VERSION}.`,
  sections: [
    {
      title: '1. Quién presta el servicio',
      body: [
        `${LEGAL_ENTITY.name}, a cargo de ${LEGAL_ENTITY.holder}, RUT ${LEGAL_ENTITY.rut}. Contacto: ${LEGAL_ENTITY.email}.`,
      ],
    },
    {
      title: '2. Qué incluye el servicio',
      body: [
        'Ficha clínica de pacientes y tutores, consulta, agenda, recetas y certificados en PDF, catálogo de enfermedades, vademécum, guías quirúrgicas, calculadoras y avisos de la clínica.',
        'Durante la etapa alpha el servicio es gratuito, puede cambiar sin aviso previo y puede tener errores. Cuando se empiece a cobrar, el plan, el precio y la forma de pago se informarán antes y no se cobrará nada sin tu aceptación expresa.',
      ],
    },
    {
      title: '3. Prueba, pago y cancelación',
      body: [
        'La cuenta nueva incluye un período de prueba sin tarjeta. Al terminar, si no hay una suscripción activa, la cuenta pasa a solo lectura: puedes ver y exportar todos tus datos, pero no crear consultas nuevas.',
        'Puedes cancelar en cualquier momento. La cancelación rige desde el fin del período ya pagado.',
      ],
    },
    {
      title: '4. Apoyo clínico: la decisión es tuya',
      body: [
        'El catálogo de enfermedades, el vademécum, las dosis, las guías quirúrgicas y las calculadoras son material de apoyo. No reemplazan tu criterio profesional ni la literatura vigente.',
        'La decisión diagnóstica y terapéutica es siempre del médico veterinario tratante. Verifica toda dosis antes de prescribir.',
      ],
    },
    {
      title: '5. Tus datos y los de tus tutores',
      body: [
        'Tú eres el responsable de los datos personales de tus tutores y de la información clínica de tus pacientes. Vet Avalon actúa como encargado del tratamiento: los guarda por cuenta tuya, solo para prestarte el servicio.',
        'Nos comprometemos a: tratarlos únicamente para prestar el servicio; no venderlos ni usarlos para otros fines; mantener medidas de seguridad razonables; avisarte sin demora si hay un incidente que los afecte; y borrarlos o devolverlos cuando termine la relación.',
        'Tú te comprometes a contar con la base legal para ingresar esos datos y a informar a tus tutores como corresponde.',
      ],
    },
    {
      title: '6. Tu cuenta',
      body: [
        'La cuenta es personal. No compartas tu contraseña. Eres responsable de lo que ocurra con tu sesión.',
        'No uses el servicio para fines ilícitos, ni intentes acceder a datos de otras cuentas ni vulnerar su seguridad.',
      ],
    },
    {
      title: '7. Disponibilidad y responsabilidad',
      body: [
        'Nos esforzamos por mantener el servicio disponible, pero no garantizamos disponibilidad ininterrumpida ni ausencia de errores. Haz respaldos de lo que sea crítico con la función de exportar.',
        'En la medida que permita la ley, nuestra responsabilidad se limita al monto pagado por el servicio en los últimos 12 meses y no alcanza a daños indirectos ni a decisiones clínicas tomadas con apoyo de la herramienta.',
      ],
    },
    {
      title: '8. Propiedad intelectual',
      body: [
        'El software, el diseño y los contenidos propios de Vet Avalon pertenecen a su titular. Se te otorga una licencia de uso personal y no exclusiva mientras tu cuenta esté vigente. Los datos que ingresas siguen siendo tuyos.',
      ],
    },
    {
      title: '9. Cambios y término',
      body: [
        'Si cambiamos estos términos, te pediremos aceptarlos de nuevo. Puedes cerrar tu cuenta cuando quieras; sus datos se eliminan de forma definitiva a los 30 días. Podemos suspender cuentas que incumplan estos términos.',
        'Estos términos se rigen por las leyes de Chile y cualquier controversia se somete a los tribunales ordinarios de justicia de Santiago.',
      ],
    },
  ],
};

export const PRIVACY: LegalDoc = {
  title: 'Política de privacidad',
  intro: `Cómo Vet Avalon trata los datos personales, conforme a la Ley 19.628 y a la Ley 21.719. Última actualización: ${LEGAL_ENTITY.updated}. Versión ${LEGAL_VERSION}.`,
  sections: [
    {
      title: '1. Quiénes somos',
      body: [
        `${LEGAL_ENTITY.name}, a cargo de ${LEGAL_ENTITY.holder}, RUT ${LEGAL_ENTITY.rut}. Correo de contacto para tus solicitudes: ${LEGAL_ENTITY.email}.`,
      ],
    },
    {
      title: '2. Qué datos guardamos',
      body: [
        'De ti (el veterinario): usuario, correo, contraseña (guardada cifrada, nunca en texto), nombre de la clínica, datos profesionales y de contacto que ingreses.',
        'De tus tutores: nombre, RUT, teléfono, correo y dirección.',
        'De tus pacientes y sus fichas: datos del animal, consultas, exámenes, recetas, vacunas y notas clínicas.',
        'Datos técnicos mínimos: dirección IP y fecha al registrarte y aceptar estos textos, y registros de errores para mantener el servicio.',
      ],
    },
    {
      title: '3. Para qué los usamos',
      body: [
        'Solo para prestarte el servicio: autenticarte, guardar y mostrar tus fichas, generar documentos, enviar correos que tú pides (recetas, recordatorios, recuperación de contraseña) y mantener la seguridad.',
        'Los datos de tus tutores y pacientes los tratamos por cuenta tuya y según tus instrucciones. No los vendemos, no hacemos publicidad con ellos y no los usamos para otros fines.',
      ],
    },
    {
      title: '4. Dónde se guardan y con quién se comparten',
      body: [
        'Usamos proveedores de infraestructura que pueden almacenar datos fuera de Chile: Neon (base de datos), Vercel (alojamiento de la aplicación) y un proveedor de correo para los envíos. Cuando se active el cobro, Flow procesará los pagos (nosotros no vemos ni guardamos los datos de tu tarjeta).',
        'No compartimos datos con nadie más, salvo que una autoridad competente lo exija conforme a la ley.',
      ],
    },
    {
      title: '5. Cuánto tiempo',
      body: [
        'Mientras tu cuenta esté activa. Si la cierras, eliminamos tus datos de forma definitiva a los 30 días. Los respaldos de la base de datos se renuevan y purgan en un ciclo breve.',
      ],
    },
    {
      title: '6. Tus derechos',
      body: [
        `Puedes pedir acceso, rectificación, supresión, oposición y portabilidad de tus datos. Puedes exportar tus datos desde la propia aplicación y escribir a ${LEGAL_ENTITY.email} para cualquier solicitud; respondemos dentro de los plazos legales.`,
        'Si tus tutores quieren ejercer sus derechos sobre los datos de su ficha, debes dirigirlos a ti, que eres el responsable; te ayudamos técnicamente a atenderlos.',
      ],
    },
    {
      title: '7. Seguridad',
      body: [
        'Conexiones cifradas, contraseñas almacenadas con hash, acceso a la base restringido y registros de error. Ningún sistema es infalible: si ocurre un incidente que afecte tus datos, te avisaremos sin demora.',
      ],
    },
    {
      title: '8. Cambios',
      body: [
        'Si cambiamos esta política te pediremos aceptarla de nuevo. Cada aceptación queda registrada con su fecha y versión.',
      ],
    },
  ],
};
