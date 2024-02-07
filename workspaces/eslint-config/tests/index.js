// Ejemplo de un archivo JavaScript largo y abstracto

'use strict'

// Definición de una clase abstracta
class Shape {
  constructor(name) {
    this.name = name
  }

  getName() {
    return this.name
  }

  // Método que debe ser implementado por las clases hijas
  getArea() {
    throw new Error('You have to implement the method getArea!')
  }
}

// Clase hija que extiende de Shape
class Circle extends Shape {
  constructor(radius) {
    super('Circle')
    this.radius = radius
  }

  getArea() {
    return Math.PI * this.radius ** 2
  }
}

// Uso de funciones y estructuras de control
function calculateArea(shape) {
  if (!(shape instanceof Shape)) {
    throw new Error('The object is not an instance of Shape')
  }

  return shape.getArea()
}

// Crear instancias y utilizar las clases y funciones
const myCircle = new Circle(5)
console.log(`Area of myCircle: ${calculateArea(myCircle)}`)

// Ejemplo de uso de estructuras de datos
const shapes = [new Circle(2), new Circle(3), new Circle(4)]

// Uso de métodos de array modernos
const areas = shapes.map(shape => shape.getArea())
console.log('Areas of shapes:', areas)

// Ejemplo de async/await
async function fetchData(url) {
  try {
    const response = await fetch(url)
    const data = await response.json()
    return data
  }
  catch (error) {
    console.error('Error fetching data:', error)
  }
}

// Llamada a la función fetchData (el URL es ficticio)
fetchData('https://api.example.com/data')
  .then(data => console.log('Fetched data:', data))
  .catch(error => console.error('Error in fetchData:', error))

// Exportar la clase y las funciones para usar en otros módulos
export { Shape, Circle, calculateArea, fetchData }
