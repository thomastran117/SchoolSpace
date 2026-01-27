/**
 * @file index.ts
 * @description
 * Namespace for the container, and provides its usage throughout the backend as a singleton instance
 *
 * @module container
 * @version 1.0.0
 * @auth Thomas
 */
import { Container } from "./container.main";

const container = Container.instance;
export default container;
