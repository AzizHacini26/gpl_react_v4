package com.gplsp.service;

import com.gplsp.entity.ClientErpT;
import com.gplsp.entity.ClientT;
import com.gplsp.entity.MultyTypesT;
import com.gplsp.entity.UserT;
import com.gplsp.repository.ClientErpR;
import com.gplsp.repository.ClientR;
import com.gplsp.repository.MultiTypesR;
import com.gplsp.repository.UserR;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ClientS {

    private final ClientR clientR;
    private final MultiTypesR multiTypesR;
    private final AuditLogS auditLogS;
    private final UserR userR;
    private final ClientErpR clientErpR;

    public ClientS(ClientR clientR, MultiTypesR multiTypesR, AuditLogS auditLogS, UserR userR, ClientErpR clientErpR) {
        this.clientR = clientR;
        this.multiTypesR = multiTypesR;
        this.auditLogS = auditLogS;
        this.userR = userR;
        this.clientErpR = clientErpR;
    }

    public List<ClientT> getAll() {
        UserT currentUser = getCurrentUser();
        if (currentUser == null) {
            return List.of();
        }
        return clientR.findByUser(currentUser);
    }

    private UserT getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (username == null)
            return null;
        return userR.findByUsername(username).orElse(null);
    }

    @SuppressWarnings("null")
    public Optional<ClientT> getById(Integer id) {
        return clientR.findById(id);
    }

    @SuppressWarnings("null")
    public ClientT create(ClientT client) {
        UserT currentUser = getCurrentUser();
        if (currentUser == null) {
            throw new IllegalStateException("No authenticated user");
        }
        client.setUser(currentUser);

        final String normalizedIdCode = normalizeIdCode(client.getIdcode());
        if (normalizedIdCode == null) {
            client.setIdcode(generateNextIdCode(currentUser, LocalDate.now().getYear()));
        } else {
            if (clientR.existsByIdcodeAndUser(normalizedIdCode, currentUser)) {
                throw new IllegalStateException("Client idcode already exists for this user");
            }
            client.setIdcode(normalizedIdCode);
        }

        if (client.getClientErp() == null || client.getClientErp().getId() == null) {
            ClientErpT erp = new ClientErpT();
            erp.setName(client.getName());
            erp.setPhone(client.getPhone());
            erp.setTiraz(client.getTiraz());
            erp.setTasalaly(client.getTasalaly());
            erp.setNumber(client.getNumber());
            erp.setTproduct(client.getTproduct());
            erp.setTverify(client.getTverify());
            erp.setCarnumb(client.getCarnumb());
            erp.setBattlenumb(client.getBattlenumb());
            erp.setLastTanjime(client.getLastTanjime());
            erp.setLastTanjime5(client.getLastTanjime5());
            erp.setFirsttverify(client.getFirsttverify());
            erp.setObs(client.getObs());
            erp.setSizeType(client.getSizeType());
            erp.setMcarmarqueT(client.getMcarmarqueT());
            erp.setMbatteltypeT(client.getMbatteltypeT());
            erp.setMsizeT(client.getMsizeT());
            erp.setMcartypeT(client.getMcartypeT());
            erp.setMdomicileT(client.getMdomicileT());
            erp.setMdocT(client.getMdocT());
            ClientErpT savedErp = clientErpR.save(erp);
            client.setClientErp(savedErp);
        }

        ClientT saved = clientR.save(client);
        auditLogS.log("client", saved.getId(), "CREATE", null, saved,
                "Created client '" + saved.getName() + "' (" + saved.getIdcode() + ")");
        return saved;
    }

    @SuppressWarnings("null")
    public Optional<ClientT> update(Integer id, ClientT clientInput) {
        return clientR.findById(id).map(existing -> {
            ClientT old = new ClientT();
            copyClientFields(old, existing);

            UserT currentUser = getCurrentUser();

            String normalizedIdCode = normalizeIdCode(clientInput.getIdcode());
            if (normalizedIdCode == null) {
                normalizedIdCode = normalizeIdCode(existing.getIdcode());
            }
            if (normalizedIdCode == null) {
                normalizedIdCode = generateNextIdCode(currentUser, LocalDate.now().getYear());
            }

            if (currentUser != null && clientR.existsByIdcodeAndIdNotAndUser(normalizedIdCode, id, currentUser)) {
                throw new IllegalStateException("Client idcode already exists for this user");
            }

            existing.setIdcode(normalizedIdCode);
            existing.setName(clientInput.getName());
            existing.setPhone(clientInput.getPhone());
            existing.setTiraz(clientInput.getTiraz());
            existing.setTasalaly(clientInput.getTasalaly());
            existing.setNumber(clientInput.getNumber());
            existing.setTproduct(clientInput.getTproduct());
            existing.setTverify(clientInput.getTverify());
            existing.setCarnumb(clientInput.getCarnumb());
            existing.setBattlenumb(clientInput.getBattlenumb());
            existing.setPrintstate(clientInput.isPrintstate());
            existing.setDatestart(clientInput.getDatestart());
            existing.setDateend(clientInput.getDateend());
            existing.setNewstate(clientInput.isNewstate());
            existing.setMoneyy(clientInput.getMoneyy());
            existing.setLastTanjime(clientInput.getLastTanjime());
            existing.setLastTanjime5(clientInput.getLastTanjime5());
            existing.setFirsttverify(clientInput.getFirsttverify());
            existing.setActive(clientInput.isActive());
            existing.setObs(clientInput.getObs());
            existing.setSent(clientInput.isSent());
            existing.setNextVisitDate(clientInput.getNextVisitDate());
            existing.setNextRetestDate(clientInput.getNextRetestDate());
            existing.setMcarmarqueT(clientInput.getMcarmarqueT());
            existing.setMbatteltypeT(clientInput.getMbatteltypeT());
            existing.setMsizeT(clientInput.getMsizeT());
            existing.setMdaysT(clientInput.getMdaysT());
            existing.setMcartypeT(clientInput.getMcartypeT());
            existing.setMstateT(clientInput.getMstateT());
            existing.setMdomicileT(clientInput.getMdomicileT());
            existing.setMdocT(clientInput.getMdocT());
            ClientT saved = clientR.save(existing);
            auditLogS.log("client", saved.getId(), "UPDATE", old, saved,
                    "Updated client '" + saved.getName() + "' (" + saved.getIdcode() + ")");
            return saved;
        });
    }

    private void copyClientFields(ClientT dest, ClientT src) {
        dest.setIdcode(src.getIdcode());
        dest.setName(src.getName());
        dest.setPhone(src.getPhone());
        dest.setTiraz(src.getTiraz());
        dest.setTasalaly(src.getTasalaly());
        dest.setNumber(src.getNumber());
        dest.setTproduct(src.getTproduct());
        dest.setTverify(src.getTverify());
        dest.setCarnumb(src.getCarnumb());
        dest.setBattlenumb(src.getBattlenumb());
        dest.setPrintstate(src.isPrintstate());
        dest.setDatestart(src.getDatestart());
        dest.setDateend(src.getDateend());
        dest.setNewstate(src.isNewstate());
        dest.setMoneyy(src.getMoneyy());
        dest.setLastTanjime(src.getLastTanjime());
        dest.setLastTanjime5(src.getLastTanjime5());
        dest.setFirsttverify(src.getFirsttverify());
        dest.setActive(src.isActive());
        dest.setObs(src.getObs());
        dest.setSent(src.isSent());
        dest.setNextVisitDate(src.getNextVisitDate());
        dest.setNextRetestDate(src.getNextRetestDate());
        dest.setMcarmarqueT(src.getMcarmarqueT());
        dest.setMbatteltypeT(src.getMbatteltypeT());
        dest.setMsizeT(src.getMsizeT());
        dest.setMdaysT(src.getMdaysT());
        dest.setMcartypeT(src.getMcartypeT());
        dest.setMstateT(src.getMstateT());
        dest.setMdomicileT(src.getMdomicileT());
        dest.setMdocT(src.getMdocT());
    }

    public Map<String, Object> importClients(List<Map<String, Object>> desktopClients) {
        UserT currentUser = getCurrentUser();
        if (currentUser == null) {
            return Map.of("imported", 0, "skipped", 0, "errors", List.of("No authenticated user"));
        }

        int imported = 0, skipped = 0;
        List<String> errors = new ArrayList<>();

        for (Map<String, Object> dc : desktopClients) {
            try {
                String idcode = stringValue(dc.get("id"));
                if (idcode == null || idcode.isBlank()) {
                    skipped++;
                    continue;
                }
                if (clientR.existsByIdcodeAndUser(idcode, currentUser)) {
                    skipped++;
                    continue;
                }

                ClientT c = new ClientT();
                c.setUser(currentUser);
                c.setIdcode(idcode);
                c.setName(stringValue(dc.get("name")));
                c.setPhone(stringValue(dc.get("phone")));
                c.setTiraz(stringValue(dc.get("tiraz")));
                c.setTasalaly(stringValue(dc.get("tasalaly")));
                c.setNumber(stringValue(dc.get("number")));
                c.setTproduct(parseDate(stringValue(dc.get("tproduct"))));
                c.setTverify(parseDate(stringValue(dc.get("tverify"))));
                c.setCarnumb(stringValue(dc.get("carnumb")));
                c.setBattlenumb(stringValue(dc.get("battlenumb")));
                c.setPrintstate(intBool(dc.get("printstate")));
                c.setDatestart(parseDate(stringValue(dc.get("datestart"))));
                c.setDateend(parseDate(stringValue(dc.get("dateend"))));
                c.setNewstate(intBool(dc.get("newstate")));
                c.setMoneyy(stringValue(dc.get("moneyy"), "0.0"));
                c.setLastTanjime(parseDate(stringValue(dc.get("lastTanjime"))));
                c.setLastTanjime5(parseDate(stringValue(dc.get("lastTanjime5"))));
                c.setFirsttverify(parseDate(stringValue(dc.get("firsttverify"))));
                c.setActive(intBool(dc.getOrDefault("active", 0)));
                c.setObs(stringValue(dc.get("obs"), ""));
                c.setSent(intBool(dc.getOrDefault("sent", 0)));
                c.setNextVisitDate(stringValue(dc.get("nextVisitDate"), ""));
                c.setNextRetestDate(stringValue(dc.get("nextRetestDate"), ""));

                c.setMcarmarqueT(resolveType(stringValue(dc.get("carMark")), "MARQUE"));
                c.setMbatteltypeT(resolveType(stringValue(dc.get("bottleMark")), "BATTELTYPE"));
                c.setMsizeT(resolveType(stringValue(dc.get("bottleSize")), "SIZE"));
                c.setMdaysT(resolveType(stringValue(dc.get("validDays")), "DAYS"));
                c.setMcartypeT(resolveType(stringValue(dc.get("carType")), "CARTYPE"));
                c.setMstateT(resolveType(stringValue(dc.get("state")), "STATE"));
                c.setMdomicileT(resolveType(stringValue(dc.get("domicile")), "DOMICILE"));
                c.setMdocT(resolveType(stringValue(dc.get("typeDoc")), "DOC"));

                ClientErpT erp = new ClientErpT();
                erp.setName(c.getName());
                erp.setPhone(c.getPhone());
                erp.setTiraz(c.getTiraz());
                erp.setTasalaly(c.getTasalaly());
                erp.setNumber(c.getNumber());
                erp.setTproduct(c.getTproduct());
                erp.setTverify(c.getTverify());
                erp.setCarnumb(c.getCarnumb());
                erp.setBattlenumb(c.getBattlenumb());
                erp.setLastTanjime(c.getLastTanjime());
                erp.setLastTanjime5(c.getLastTanjime5());
                erp.setFirsttverify(c.getFirsttverify());
                erp.setObs(c.getObs());
                erp.setSizeType(c.getSizeType());
                erp.setMcarmarqueT(c.getMcarmarqueT());
                erp.setMbatteltypeT(c.getMbatteltypeT());
                erp.setMsizeT(c.getMsizeT());
                erp.setMcartypeT(c.getMcartypeT());
                erp.setMdomicileT(c.getMdomicileT());
                erp.setMdocT(c.getMdocT());
                ClientErpT savedErp = clientErpR.save(erp);
                c.setClientErp(savedErp);

                clientR.save(c);
                imported++;
            } catch (Exception e) {
                errors.add("Row '" + stringValue(dc.get("id")) + "': " + e.getMessage());
            }
        }

        return Map.of("imported", imported, "skipped", skipped, "errors", errors);
    }

    @SuppressWarnings("null")
    public boolean delete(Integer id) {
        Optional<ClientT> existing = clientR.findById(id);
        if (existing.isEmpty()) {
            return false;
        }
        ClientT client = existing.get();
        clientR.deleteById(id);
        auditLogS.log("client", id, "DELETE", client, null,
                "Deleted client '" + client.getName() + "' (" + client.getIdcode() + ")");
        return true;
    }

    private String stringValue(Object obj) {
        return stringValue(obj, null);
    }

    private String stringValue(Object obj, String def) {
        return obj == null ? def : obj.toString().trim();
    }

    private boolean intBool(Object obj) {
        if (obj == null)
            return false;
        String s = obj.toString().trim();
        return "1".equals(s) || "true".equalsIgnoreCase(s);
    }

    private Date parseDate(String value) {
        if (value == null || value.isBlank() || "-----".equals(value))
            return null;
        try {
            return Date.valueOf(value);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private MultyTypesT resolveType(String nom, String type) {
        if (nom == null || nom.isBlank())
            return null;
        Optional<MultyTypesT> existing = multiTypesR.findByNom(nom);
        if (existing.isPresent())
            return existing.get();
        MultyTypesT mt = new MultyTypesT();
        mt.setNom(nom);
        mt.setType(type);
        return multiTypesR.save(mt);
    }

    private String normalizeIdCode(String idcode) {
        if (idcode == null)
            return null;
        final String normalized = idcode.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    public String getNextIdCode(int year) {
        UserT currentUser = getCurrentUser();
        if (currentUser == null) {
            return year + "-1";
        }
        return generateNextIdCode(currentUser, year);
    }

    private String generateNextIdCode(UserT user, int year) {
        final String yearPrefix = year + "-";
        int maxSequence = 0;

        List<ClientT> userClients = user != null ? clientR.findByUser(user) : clientR.findAll();
        for (ClientT client : userClients) {
            final String candidate = normalizeIdCode(client.getIdcode());
            if (candidate == null || !candidate.startsWith(yearPrefix)) {
                continue;
            }

            final int separatorIndex = candidate.indexOf('-');
            if (separatorIndex <= 0) {
                continue;
            }

            try {
                final int sequence = Integer.parseInt(candidate.substring(separatorIndex + 1));
                if (sequence > maxSequence) {
                    maxSequence = sequence;
                }
            } catch (NumberFormatException ignored) {
            }
        }

        return yearPrefix + (maxSequence + 1);
    }
}
