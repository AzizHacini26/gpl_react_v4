package com.gplsp.service;

import com.gplsp.entity.ClientT;
import com.gplsp.entity.DebtDetailsDto;
import com.gplsp.entity.DebtDetailsTable;
import com.gplsp.repository.ClientR;
import com.gplsp.repository.DebtDetailsR;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class DebtDetailsS {

    private final DebtDetailsR debtDetailsR;
    private final ClientR clientR;
    private final AuditLogS auditLogS;

    public DebtDetailsS(DebtDetailsR debtDetailsR, ClientR clientR, AuditLogS auditLogS) {
        this.debtDetailsR = debtDetailsR;
        this.clientR = clientR;
        this.auditLogS = auditLogS;
    }

    private static final String STATUS_DEBT = "دين";
    private static final String STATUS_PAYMENT = "تسديد";

    private BigDecimal parseAmount(String value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        String normalized = value.trim()
                .replace(" ", "")
                .replace(" ", "")
                .replace(",", ".");
        if (normalized.isBlank()) {
            return BigDecimal.ZERO;
        }
        try {
            return new BigDecimal(normalized);
        } catch (NumberFormatException e) {
            return BigDecimal.ZERO;
        }
    }

    private String formatAmount(BigDecimal amount) {
        if (amount == null) {
            return "0";
        }
        return amount.setScale(2, RoundingMode.HALF_UP).stripTrailingZeros().toPlainString();
    }

    private int getStatusSign(String status) {
        if (status == null) {
            return 0;
        }
        String normalized = status.trim();
        if (STATUS_DEBT.equalsIgnoreCase(normalized) || "DEBT".equalsIgnoreCase(normalized)) {
            return 1;
        }
        if (STATUS_PAYMENT.equalsIgnoreCase(normalized) || "PAID".equalsIgnoreCase(normalized)) {
            return -1;
        }
        return 0;
    }

    private BigDecimal computeDebtEffect(String status, String amount) {
        int sign = getStatusSign(status);
        return parseAmount(amount).multiply(BigDecimal.valueOf(sign));
    }

    private void adjustClientMoney(ClientT client, BigDecimal delta) {
        if (client == null || delta == null || delta.compareTo(BigDecimal.ZERO) == 0) {
            return;
        }
        BigDecimal current = parseAmount(client.getMoneyy());
        BigDecimal updated = current.add(delta);
        client.setMoneyy(formatAmount(updated));
        clientR.save(client);
    }

    public List<DebtDetailsDto> getAll() {
        return debtDetailsR.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public Optional<DebtDetailsDto> getById(Integer id) {
        return debtDetailsR.findById(id).map(this::toDto);
    }

    public DebtDetailsDto create(DebtDetailsDto debtDetailsDto) {
        DebtDetailsTable saved = debtDetailsR.save(toEntity(debtDetailsDto, new DebtDetailsTable()));
        adjustClientMoney(saved.getClientT(), computeDebtEffect(saved.getStatus(), saved.getAmount()));
        String clientName = saved.getCustomer() != null ? saved.getCustomer() : "";
        auditLogS.log("debt", saved.getId(), "CREATE", null, saved,
                "Created debt of " + saved.getAmount() + " for " + clientName);
        return toDto(saved);
    }

    public Optional<DebtDetailsDto> update(Integer id, DebtDetailsDto debtDetailsDto) {
        return debtDetailsR.findById(id)
                .map(existing -> {
                    DebtDetailsTable old = new DebtDetailsTable();
                    old.setId(existing.getId());
                    old.setPrixx(existing.getPrixx());
                    old.setProd(existing.getProd());
                    old.setTypewasl(existing.getTypewasl());
                    old.setDateInsert(existing.getDateInsert());
                    old.setCustomer(existing.getCustomer());
                    old.setPhone(existing.getPhone());
                    old.setAmount(existing.getAmount());
                    old.setStatus(existing.getStatus());
                    old.setClientT(existing.getClientT());

                    BigDecimal oldEffect = computeDebtEffect(old.getStatus(), old.getAmount());
                    DebtDetailsTable saved = debtDetailsR.save(toEntity(debtDetailsDto, existing));
                    BigDecimal newEffect = computeDebtEffect(saved.getStatus(), saved.getAmount());

                    ClientT previousClient = old.getClientT();
                    ClientT updatedClient = saved.getClientT();

                    if (previousClient != null && updatedClient != null && !previousClient.getId().equals(updatedClient.getId())) {
                        adjustClientMoney(previousClient, oldEffect.negate());
                        adjustClientMoney(updatedClient, newEffect);
                    } else {
                        adjustClientMoney(updatedClient != null ? updatedClient : previousClient, newEffect.subtract(oldEffect));
                    }

                    auditLogS.log("debt", saved.getId(), "UPDATE", old, saved,
                            "Updated debt " + saved.getId() + " (" + saved.getAmount() + ")");
                    return toDto(saved);
                });
    }

    public boolean delete(Integer id) {
        Optional<DebtDetailsTable> existing = debtDetailsR.findById(id);
        if (existing.isEmpty()) {
            return false;
        }
        DebtDetailsTable debt = existing.get();
        BigDecimal effect = computeDebtEffect(debt.getStatus(), debt.getAmount());
        debtDetailsR.deleteById(id);
        adjustClientMoney(debt.getClientT(), effect.negate());
        auditLogS.log("debt", id, "DELETE", debt, null,
                "Deleted debt " + id + " (" + debt.getAmount() + ")");
        return true;
    }

    private DebtDetailsDto toDto(DebtDetailsTable entity) {
        DebtDetailsDto dto = new DebtDetailsDto();
        dto.setId(entity.getId());
        if (entity.getClientT() != null) {
            dto.setClientId(entity.getClientT().getId());
            dto.setClientName(entity.getClientT().getName());
        }
        dto.setPhone(entity.getPhone());
        dto.setAmount(entity.getAmount());
        dto.setStatus(entity.getStatus());
        dto.setDateInsert(entity.getDateInsert());
        return dto;
    }

    private DebtDetailsTable toEntity(DebtDetailsDto dto, DebtDetailsTable entity) {
        if (dto.getClientId() != null) {
            ClientT client = clientR.findById(dto.getClientId())
                    .orElseThrow(() -> new IllegalArgumentException("Client not found"));
            entity.setClientT(client);
            entity.setCustomer(client.getName());
        } else {
            entity.setClientT(null);
            entity.setCustomer(null);
        }

        entity.setPhone(dto.getPhone());
        entity.setAmount(dto.getAmount());
        entity.setStatus(dto.getStatus());
        entity.setDateInsert(dto.getDateInsert());
        return entity;
    }
}
