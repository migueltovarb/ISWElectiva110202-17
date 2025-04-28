import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import VehicleList from "./VehicleList"
import axios from "axios"
import { afterEach } from "vitest"
import { vi } from "vitest"
import "@testing-library/jest-dom/extend-expect"

vi.mock("axios");

describe("VehicleList Component", () => {
    afterEach(() => {
        vi.clearAllMocks();
        });

    it("renders loading state initialy", () => {
        axios.get.mockResolvedValue({ data: [] });
        render(<VehicleList />);
        expect(screen.getByText(/Cargando vehículos.../i)).toBeInTheDocument();
        });

});
