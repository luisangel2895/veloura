import type { Category } from "@/types/catalog";

const categoryCopy = {
  balconette:
    "La categoria balconette de Veloura fue pensada para clientas que buscan estructura impecable sin perder ligereza visual. Cada silueta eleva el busto con una linea limpia, copas suaves y tirantes refinados que equilibran soporte con una presencia silenciosa. Trabajamos satines mates, microtules y encajes contenidos para que la prenda se sienta lujosa desde el primer contacto, pero tambien funcional en la rutina diaria. El resultado es una seleccion que acompana camisas abiertas, vestidos con escote y estilismos de noche sin sentirse excesiva. En esta familia de producto el ajuste importa, por eso las tallas fueron curadas para mantener forma, suavidad y confort durante todo el dia. Si buscas una base elegante para un guardarropa intimo moderno, esta coleccion ofrece piezas con caracter, acabados delicados y una sensualidad precisa, sobria y claramente premium.",
  bodysuits:
    "Los bodysuits de Veloura convierten la lenceria en una pieza de estilo con vocacion de guardarropa completo. Son prendas construidas para verse tan bien debajo de un blazer como dentro de una rutina intima cuidada. La arquitectura visual parte de cortes largos, compresion moderada y paneles transparentes que definen la figura sin rigidez. En esta categoria el lujo no depende del exceso, sino de la precision: costuras discretas, tacto sedoso, brillo controlado y una silueta que estiliza con naturalidad. Cada modelo fue desarrollado para acompanar movimiento real, por eso el ajuste abraza sin presionar y mantiene estabilidad durante horas. El resultado es una propuesta sobria, editorial y versatil que responde a quien quiere una prenda sensual, funcional y muy pulida. Si tu armario pide piezas que cruzan el limite entre interiorismo y moda, este es el punto de partida mas consistente de la coleccion.",
  bridal:
    "La linea bridal de Veloura traduce el ritual previo a una celebracion en una experiencia mas calma, mas elegante y mejor resuelta. Aqui se encuentran tonos suaves, brillos discretos y texturas que evocan ceremonia sin caer en lo obvio. Esta categoria fue diseniada para acompanarte desde la prueba del vestido hasta la ultima capa del look final, con piezas que respetan la delicadeza de la ocasion y a la vez ofrecen soporte confiable. Las transparencias estan medidas, los acabados son limpios y el tacto prioriza comodidad para que cada prenda se sienta especial durante muchas horas. Pensamos esta seleccion para novias, eventos de compromiso, lunas de miel y cualquier momento donde el detalle importa tanto como la presencia general. El resultado es una curaduria de lenceria luminosa, moderna y refinada que mantiene la identidad minimalista de Veloura mientras introduce un lenguaje mas ceremonial.",
  lounge:
    "La categoria lounge parte de una idea simple: el confort tambien puede sentirse profundamente lujoso. Veloura propone aqui piezas suaves, serenas y visualmente limpias para quienes valoran la intimidad cotidiana tanto como la estetica. Los tejidos fueron elegidos por su caida amable, su tacto envolvente y su capacidad de acompanar horas largas en casa, viajes o capas ligeras de descanso. No se trata de ropa de estar sin intencion, sino de una extension del mismo criterio que define toda la marca: proporciones equilibradas, detalles sutiles y una sensualidad tranquila. Esta coleccion favorece combinaciones faciles, capas livianas y una silueta relajada que nunca pierde pulso editorial. Si buscas prendas que te permitan bajar el ritmo sin renunciar a una presencia cuidada, esta familia concentra el lado mas sereno de Veloura con acabados premium, tonos profundos y un enfoque claro en bienestar sofisticado.",
} as const;

export const mockCategories: Category[] = [
  {
    id: "cat-01",
    slug: "balconette",
    name: "Balconette",
    description: "Copas estructuradas con presencia delicada.",
    seoCopy: categoryCopy.balconette,
    heroEyebrow: "Sculpted lift",
  },
  {
    id: "cat-02",
    slug: "bodysuits",
    name: "Bodysuits",
    description: "Siluetas de una pieza para capas refinadas.",
    seoCopy: categoryCopy.bodysuits,
    heroEyebrow: "Second-skin tailoring",
  },
  {
    id: "cat-03",
    slug: "bridal",
    name: "Bridal",
    description: "Piezas luminosas para rituales y celebraciones.",
    seoCopy: categoryCopy.bridal,
    heroEyebrow: "Ceremony edit",
  },
  {
    id: "cat-04",
    slug: "lounge",
    name: "Lounge",
    description: "Confort sereno con sensibilidad editorial.",
    seoCopy: categoryCopy.lounge,
    heroEyebrow: "Quiet indulgence",
  },
];

export function getMockCategories(): Category[] {
  return mockCategories;
}

export function getMockCategoryBySlug(slug: string): Category | undefined {
  return mockCategories.find((category) => category.slug === slug);
}
